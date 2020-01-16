/* 
    This file is part of MiraMon Map Browser.
    MiraMon Map Browser is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foobar is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with MiraMon Map Browser.  If not, see "http://www.gnu.org/licenses/".

    Copyright 2001, 2019 Xavier Pons

    Aquest codi JavaScript ha estat realitzat per Joan Mas� Pau 
    (joan maso at uab cat) i Nuria Juli� (n julia at creaf uab cat)
    dins del grup de MiraMon. MiraMon �s un projecte del Centre
    de recerca i aplicacions forestals (CREAF) que elabora programari de 
    Sistema d'Informaci� Geogr�fica i de Teledetecci� per a la 
    visualitzaci�, consulta, edici� i an�lisi de mapes r�sters i 
    vectorials. Elabora programari d'escriptori i tamb� servidors i clients 
    per Internet. No tots aquests productes s�n gratu�ts o de codi obert. 
    En particular, el Navegador de Mapes del MiraMon (client per Internet) 
    es distribueix sota els termes de la llic�ncia "GNU General Public 
    License". Es pot actualitzar des de www.creaf.uab.cat/miramon/mmn
*/

"use strict"

var GraphsMM={hihaElements:false};

function EsborraGrafLlinatge()
{
	GraphsMM.nodes=null;
	GraphsMM.edges=null;
	GraphsMM.sortedNodId=null;
	if(GraphsMM.nodesGraf)
		GraphsMM.nodesGraf.clear();
    if(GraphsMM.edgesGraf)
		GraphsMM.edgesGraf.clear();
	if(GraphsMM.lineageNetWork)
		GraphsMM.lineageNetWork.setData({nodes:GraphsMM.nodesGraf, edges:GraphsMM.edgesGraf})
	GraphsMM.hihaElements=false;
}

function ComparaEdgesLlinatge(a, b)
{
	if (a.label < b.label) return -1; 
	if (a.label > b.label) return 1;
	if (a.from < b.from) return -1; 
	if (a.from > b.from) return 1;
	if (a.to < b.to) return -1; 
	if (a.to > b.to) return 1;
	return 0;
}

function ComparaNodesLlinatge(a, b)
{	
	// Ordeno per group i dins de cada group per alguna cosa diferencial.
	if (a.group < b.group) return -1; 
	if (a.group > b.group) return 1;
	if(a.group=="resultat")  // Potser hauria de comparar tamb� els resultats amb les fonts, perqu� potser que el propi resultat sigui la font d'alguna cosa �$�
	{
		if (a.label < b.label) return -1;
		if (a.label > b.label) return 1;
		return 0;
	}
	if(a.group=="font")
	{
		if (a.source.reference < b.source.reference) return -1;
		if (a.source.reference > b.source.reference) return 1;
		return 0;
	}
	/*By definition a process is always different from another because they were executed in different times. 
	The only exception is a process that generates 2 outputs at the same time.*/
	if(a.group=="proces")
	{
		if (a.proces.purpose < b.proces.purpose) return -1; 
		if (a.proces.purpose > b.proces.purpose) return 1;
		if (a.proces.timeDate < b.proces.timeDate) return -1; 
		if (a.proces.timeDate > b.proces.timeDate) return 1;
		return 0;
	}
	if(a.group=="agent")
	{
		/*I believe the role should always be processor, so I decided to ignore it
		if (a.processor.role < b.processor.role) return -1; 
		if (a.processor.role > b.processor.role) return 1;*/
		if (!a.processor.party && b.processor.party) return -1;
		if (a.processor.party && !b.processor.party) return 1;
		if (a.processor.party && b.processor.party)
		{
			if (!a.processor.party.organisation && b.processor.party.organisation) return -1;
			if (a.processor.party.organisation && !b.processor.party.organisation) return 1;
			if (a.processor.party.organisation && b.processor.party.organisation)
			{
				if (a.processor.party.organisation.name < b.processor.party.organisation.name) return -1;
				if (a.processor.party.organisation.name > b.processor.party.organisation.name) return 1;
			}
			if (!a.processor.party.individual && b.processor.party.individual) return -1;
			if (a.processor.party.individual && !b.processor.party.individual) return 1;
			if (a.processor.party.individual && b.processor.party.individual)
			{
				if (a.processor.party.individual.name < b.processor.party.individual.name) return -1;
				if (a.processor.party.individual.name > b.processor.party.individual.name) return 1;
			}
		}
		return 0;
	}
	if(a.group=="executable")
	{
		if (a.executable < b.executable) return -1;
		if (a.executable > b.executable) return 1;
		return 0;
	}
	return 0; 
}


function CreaGrafProcesLlinatge(info_graf, proces, id_pare)
{
var j, i_node, i_edge, id_proces, id_usar;

	i_node=info_graf.nodes.binarySearch({group:"proces", proces: proces}, ComparaNodesLlinatge);
	if(i_node>=0) // trobat
	{
		id_proces=info_graf.nodes[i_node].id;
	}
	else // no trobat, retorna (-n-1) on n �s la posici� on he d'insertar l'element
	{
		id_proces=info_graf.nodes.length+1;
		info_graf.nodes.splice(-i_node-1, 0, {id:id_proces, label: "proces"+id_proces, title: proces.purpose, group:"proces", proces: proces});
	}
	i_edge=info_graf.edges.binarySearch({from: id_pare, to: id_proces, label: 'wasGeneratedBy'}, ComparaEdgesLlinatge);
	if(i_edge<0) // no trobat
	{
		info_graf.edges.splice(-i_edge-1, 0, {from: id_pare, to: id_proces, arrows:'to', label: 'wasGeneratedBy', font: {align: 'top', size: 10}});
	}			
	if(proces.processor)
	{
		for(j=0; j<proces.processor.length;j++)
		{
			var pro=proces.processor[j];
			if (pro.party && 	
				((pro.party.organisation && pro.party.organisation.name) ||
				 (pro.party.individual && pro.party.individual.name)) )
			{
				i_node=info_graf.nodes.binarySearch({group:"agent", processor: pro}, ComparaNodesLlinatge);
				if(i_node>=0) // trobat
				{
					id_usar=info_graf.nodes[i_node].id;
				}
				else // no trobat, retorna (-n-1) on n �s la posici� on he d'insertar l'element
				{
					id_usar=info_graf.nodes.length+1;
					info_graf.nodes.splice(-i_node-1, 0, {id:id_usar, 
									label: "agent"+id_usar, 
									title: (pro.role ? (pro.role+": ") : "" )+ 
										(pro.party ? 
											(
												((pro.party.organisation && pro.party.organisation.name) ? pro.party.organisation.name : "") + 
												((pro.party.individual && pro.party.individual.name) ? pro.party.individual.name : "")
											) : ""
										), 
									group: "agent", 
									processor: pro});
				}			
				// els segments tamb� he de fer una cerca i inserci� ordenada perqu� tamb� hi podria haver repeticions
				i_edge=info_graf.edges.binarySearch({from: id_proces, to: id_usar, label: 'wasAssociatedWith'}, ComparaEdgesLlinatge);
				if(i_edge<0) // no trobat
				{
					info_graf.edges.splice(-i_edge-1, 0, {from: id_proces, to: id_usar, arrows:'to', label: 'wasAssociatedWith', font: {align: 'top', size: 10}});
				}
			}
		}
	}
	if(proces.executable)
	{
		i_node=info_graf.nodes.binarySearch({group:"executable", executable: proces.executable}, ComparaNodesLlinatge);
		if(i_node>=0) // trobat
		{
			id_usar=info_graf.nodes[i_node].id;
		}
		else // no trobat, retorna (-n-1) on n �s la posici� on he d'insertar l'element
		{
			id_usar=info_graf.nodes.length+1;
			info_graf.nodes.splice(-i_node-1, 0, {id:id_usar, label: "executable"+id_usar, title: proces.executable, group:"executable", executable: proces.executable});
		}
		i_edge=info_graf.edges.binarySearch({from: id_proces, to: id_usar, label: 'used'}, ComparaEdgesLlinatge);
		if(i_edge<0) // no trobat
		{
			info_graf.edges.splice(-i_edge-1, 0, {from: id_proces, to: id_usar, arrows:'to', label: 'used', font: {align: 'top', size: 10}});					
		}
	}
	if(proces.parameters)
	{
		for(j=0; j<proces.parameters.length;j++)
		{
			if(proces.parameters[j].valueType=="source" && typeof proces.parameters[j].source!=="undefined" && proces.parameters[j].source!=null)
				CreaGrafFontLlinatge(info_graf, proces.parameters[j].direction, proces.parameters[j].source, id_proces);
		}				
	}	
	return;
}

function CreaGrafFontLlinatge(info_graf, direction, source, id_pare)
{
var id_font, i_node, i_edge;
 
	i_node=info_graf.nodes.binarySearch({group:"font", source: source}, ComparaNodesLlinatge);
	if(i_node>=0) // trobat
	{
		id_font=info_graf.nodes[i_node].id;
	}
	else // no trobat, retorna (-n-1) on n �s la posici� on he d'insertar l'element
	{
		id_font=info_graf.nodes.length+1;
		info_graf.nodes.splice(-i_node-1, 0, {id:id_font, label: "font"+id_font, title:source.reference, group:"font", source: source});
	}
	if(direction=="in")
	{
		i_edge=info_graf.edges.binarySearch({from: id_pare, to:id_font, label: 'used'}, ComparaEdgesLlinatge);
		if(i_edge<0) // no trobat
		{
			info_graf.edges.splice(-i_edge-1, 0, {from: id_pare, to: id_font, arrows:'to', label: 'used', font: {align: 'top', size: 10}});					
		}
	}
	else
	{
		i_edge=info_graf.edges.binarySearch({from: id_font, to:id_pare, label: 'wasGeneratedBy'}, ComparaEdgesLlinatge);
		if(i_edge<0) // no trobat
		{
			info_graf.edges.splice(-i_edge-1, 0, {from: id_font, to: id_pare, arrows:'to', label: 'wasGeneratedBy', font: {align: 'top', size: 10}});					
		}	
	}
	if (source.processes)
	{
		for(var i=0; i<source.processes.length; i++)
			CreaGrafProcesLlinatge(info_graf, source.processes[i], id_font);
	}
	return;
}

function sortSortedNodId(a, b)
{
	return ((a.id < b.id) ? -1 : ((a.id > b.id) ? 1 : 0));
}

function findSortedNodId(id, b)
{
	return ((id < b.id) ? -1 : ((id > b.id) ? 1 : 0));
}


function FesLlistaOrdenaNodesPerId(graphsMM)
{
	graphsMM.sortedNodId=[];
	for (var i=0; i<graphsMM.nodes.length; i++)
	{
		graphsMM.sortedNodId[i]={id: graphsMM.nodes[i].id, i: i};
	}	
	graphsMM.sortedNodId.sort(sortSortedNodId);
}

function INodFromNetworkId(graphsMM, id)
{
	var i=graphsMM.sortedNodId.binarySearch(id,findSortedNodId);
	if (i<0 || i>graphsMM.sortedNodId.length)
		return -1;
	return graphsMM.sortedNodId[i].i;
}


function DonaInformacioAssociadaANodeLlinatge(params)
{
var cdns=[], node;	
     // a params rebo un array dels id dels nodes seleccionats 
	 // i a partir de la llista ordenada i d'equivalents entre id i i trobo el node/s dels quals vull la informaci�0
	for (var i_nod=0; i_nod<params.nodes.length; i_nod++)
	{
		node=GraphsMM.nodes[INodFromNetworkId(GraphsMM, params.nodes[i_nod])];
		if(node.group=="resultat")
	    {
			cdns.push("Capa Resultat" );
	    }
		else if(node.group=="font")
	    {
			cdns.push("Font: "+ node.source.reference);
	    }
		else if(node.group=="proces")
		{
			cdns.push("Proc�s: "+ node.proces.purpose);
		}
		else if(node.group=="agent")
		{
			if(node.processor.role)
				cdns.push(node.processor.role + ": ");
			else
				cdns.push("Agent: ");
			cdns.push(node.processor.name);
		}
		else if(node.group=="executable")
		{
			cdns.push("Executable: "+node.executable);
		}	
	}
	return cdns.join("");
}

function CreaGrafLlinatge(nom_div, capa)
{
var i;
	
	if(GraphsMM.hihaElements)
		EsborraGrafLlinatge();
	
	if(!capa || !capa.metadades || !capa.metadades.provenance || !capa.metadades.provenance.lineage)
		return;
	GraphsMM.capa=capa;
	var lli=capa.metadades.provenance.lineage;
		
	// El primer que he de possar �s la capa generada, que �s la que estic documentant el llinatge i tot penja d'aquesta capa.	
	var info_graf={};
	info_graf.nodes=[{id:1, label: capa.nom, group:"resultat", capa: capa}];
	info_graf.edges=[];
	// Ara miro els processos i les fonts que pengen d'aquesta capa
	// Anir� afegint els nodes de manera ordenada per nom i group
	if(lli.processes)
	{
		for(i=0; i<lli.processes.length; i++)
			CreaGrafProcesLlinatge(info_graf, lli.processes[i], 1);
	}	
	if(lli.sources)
	{
		for(i=0; i<lli.sources.length; i++)
			CreaGrafFontLlinatge(info_graf, "in", lli.sources[i], 1);			
	}
	
	GraphsMM.nodesGraf = new vis.DataSet(info_graf.nodes);	
	GraphsMM.edgesGraf = new vis.DataSet(info_graf.edges);	
		
	GraphsMM.options = { 
		"interaction": { "navigationButtons": true, "keyboard": true},
		"layout": {"improvedLayout": false},
		"nodes": {"shape": "box", "borderWidth": 2, "shadow":true},
		"edges": {"font": {"align": "top", "size": 10}},
		"groups": {
			"font": {"shape": "ellipse","color": {"background":"LightYellow", "border":"GoldenRod"}},
			"executable": {"shape": "ellipse","color": {"background":"DarkSeaGreen", "border":"ForestGreen"}},
			"proces": {"shape":"box","color":{"background":"LightSteelBlue", "border":"purple"}},
			"resultat": {"shape": "ellipse","color": {"background":"LightYellow","border":"GoldenRod"}, "borderWidth": 3},
			"agent": {"shape":"circle","color":{"background":"DarkSalmon","border":"Bisque"}},
	        }
	};
	GraphsMM.nodes=info_graf.nodes;
	GraphsMM.div=nom_div;	
	GraphsMM.lineageNetWork = new vis.Network(document.getElementById(nom_div), {nodes: GraphsMM.nodesGraf, edges: GraphsMM.edgesGraf},  GraphsMM.options);
	GraphsMM.lineageNetWork.on("click", function (params) {document.getElementById("InfoLlinatge").innerHTML = DonaInformacioAssociadaANodeLlinatge(params)});
	GraphsMM.nodes=info_graf.nodes;	
	GraphsMM.darrerIdUsat=info_graf.nodes.length;
	GraphsMM.hihaElements=true;
	FesLlistaOrdenaNodesPerId(GraphsMM);
}

function MostraLlinatgeCapa(param)
{	
//	var contingut=[];
//	contingut.push("<div id=\"LayerLlinatgeCapa\" class=\"Verdana11px\" style=\"position:absolute;left:100px;top:100px;width:95%\">kk</div>");

	contentLayer(param.elem, "<div id=\"LayerLlinatgeCapa\" class=\"Verdana11px\" style=\"position:absolute;left:10px;top:10px;width:500px;height:500px;border: 1px solid lightgray;\"></div><br><div id=\"InfoLlinatge\" class=\"Verdana11px\" style=\"position:absolute;left:10px;top:520px;width:500px;height:50px;border: 1px solid lightgray;\"></div>");
	CreaGrafLlinatge("LayerLlinatgeCapa", param.capa);
}

function OmpleLlinatgeCapa(doc,info_lli)
{
var capa, records;

	if(!doc) 
	{
		CanviaEstatEventConsola(null, info_lli.i_event, EstarEventError);
		return;
	}
	capa=ParamCtrl.capa[info_lli.i_capa];
	try {
		var doc_json=JSON.parse(doc);
		records=doc_json.records;
	} 
	catch (e) {
		CanviaEstatEventConsola(null, info_lli.i_event, EstarEventError);
		return;
	}
	if(records && records.length>0)
	{
		if(records[0].lineage)
		{
			if (!capa.metadades.provenance)
				capa.metadades.provenance={"lineage": records[0].lineage};
			else
				capa.metadades.provenance.lineage=records[0].lineage;			
		}
	}
	CanviaEstatEventConsola(null, info_lli.i_event, EstarEventTotBe);
	if(info_lli.funcio)
		info_lli.funcio(info_lli.param);
	return;
}

function ErrorOmpleLlinatgeCapa(doc,info_lli)
{
	CanviaEstatEventConsola(null, info_lli.i_event, EstarEventError);
}


function DonaRequestCSWGetRecordByIdPerLlinatge(i_capa)
{
var cdns=[];
var capa=ParamCtrl.capa[i_capa];

	// �$� Cal resoldre el tema del EPSG al servidor, ara per ara no es fa res en el servidor i es busca directament la secci� que cont�
	// el valor indicat per ID [capa.nom, ":", ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS] i si no existeix falla
	// caldria fer alguna heur�stica com en el cas del WMS
	cdns.push("SERVICE=CSW&REQUEST=GetRecordByID&OUTPUTSCHEMA=http://www.isotc211.org/2005/gmd&ELEMENTSETNAME=lineage&ID=", 
			  capa.nom, ":", 
			  ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS, "&OUTPUTFORMAT=application/json");
	return AfegeixNomServidorARequest(DonaServidorCapa(capa.servidor), cdns.join(""), true, capa.cors==true ? true : false);
}

function DescarregaLlinatgeCapa(i_capa, funcio, param)
{
	var url=DonaRequestCSWGetRecordByIdPerLlinatge(i_capa);
	var i_event=CreaIOmpleEventConsola("GetRecordById", i_capa, url, TipusEventGetRecordByIdLlinatge);
	
	loadFile(url, "application/json", OmpleLlinatgeCapa, ErrorOmpleLlinatgeCapa, {i_capa: i_capa, i_event: i_event, funcio: funcio, param: param});
}

function FinestraMostraLlinatgeCapa(elem, i_capa)
{
var capa=ParamCtrl.capa[i_capa];

	if(!capa.metadades || !capa.metadades.provenance)
		return;
	var prov=capa.metadades.provenance;
	if(prov.peticioServCSW && !prov.lineage)
	{
		//MostraLlinatgeCapa(elem, capa);
		//return;
		// Demano el llinatge al servidor i el carrego a mem�ria
		DescarregaLlinatgeCapa(i_capa, MostraLlinatgeCapa, {elem: elem, capa: capa});
		return;
	}
	if(prov.lineage)
		MostraLlinatgeCapa({elem: elem, capa: capa});
	return;
}

