/* 
    This file is part of MiraMon Map Browser.
    MiraMon Map Browser is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    MiraMon Map Browser is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
    See the GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General 
    Public License along with MiraMon Map Browser.
    If not, see https://www.gnu.org/licenses/licenses.html#AGPL.
    
    MiraMon Map Browser can be updated from
    https://github.com/grumets/MiraMonMapBrowser.

    Copyright 2001, 2021 Xavier Pons

    Aquest codi JavaScript ha estat idea de Joan Mas� Pau (joan maso at uab cat) 
    amb l'ajut de N�ria Juli� (n julia at creaf uab cat)
    dins del grup del MiraMon. MiraMon �s un projecte del 
    CREAF que elabora programari de Sistema d'Informaci� Geogr�fica 
    i de Teledetecci� per a la visualitzaci�, consulta, edici� i an�lisi 
    de mapes r�sters i vectorials. Aquest programari inclou
    aplicacions d'escriptori i tamb� servidors i clients per Internet.
    No tots aquests productes s�n gratu�ts o de codi obert. 
    
    En particular, el Navegador de Mapes del MiraMon (client per Internet) 
    es distribueix sota els termes de la llic�ncia GNU Affero General Public 
    License, mireu https://www.gnu.org/licenses/licenses.html#AGPL.
    
    El Navegador de Mapes del MiraMon es pot actualitzar des de 
    https://github.com/grumets/MiraMonMapBrowser.
*/

"use strict"

var model_vector="vector";

function InicialitzaTilesSolicitatsCapaDigi(capa)
{
var tiles;

	if (capa.tipus && capa.model==model_vector)
	{
		if (!capa.TileMatrixGeometry)
		{
			capa.TileMatrixGeometry={"MatrixWidth": 1, "MatrixHeight": 1, "tiles_solicitats": []};
			tiles=capa.TileMatrixGeometry;
		}	
		else
		{
			tiles=capa.TileMatrixGeometry;
			if (!tiles.MatrixWidth)
				tiles.MatrixWidth=1;
			if (!tiles.MatrixHeight)
				tiles.MatrixHeight=1;
			//Creo un array de tiles
			tiles.tiles_solicitats=[];
		}
		for(var i_tiles=0; i_tiles<tiles.MatrixWidth*tiles.MatrixHeight; i_tiles++)
			tiles.tiles_solicitats[i_tiles]="TileNoSolicitat";
	}
}


//Fer sol�licitar la informaci� dels atributs d'un punt determinat
function ComparaObjCapaDigiIdData(x,y) {
	//Ascendent per identificador i descendent per data
	if (x.id < y.id) return -1; 
	if (x.id > y.id) return 1;
	if (x.data && y.data)
	{
		if ( x.data > y.data) return -1;
		if ( x.data < y.data) return 1;
	}
	return 0; 
}

function OmpleAtributsObjecteCapaDigiDesDeWFS(objecte_xml, atributs, feature)
{
var atribut;
var atrib_coll_xml, atrib_xml, tag2;

	atrib_coll_xml=DonamElementsNodeAPartirDelNomDelTag(objecte_xml, "http://miramon.uab.cat/ogc/schemas/atribut", "mmatrib", "Atribut");
	if (!atrib_coll_xml || atrib_coll_xml.length==0)
		return;
	atributs=[];  //Potser seria millor no esborrar-los cada cop per� ara per ara ha quedat aix�
	for(var i=0; i<atrib_coll_xml.length; i++)			
	{
		atrib_xml=atrib_coll_xml[i];
		atributs.push({});
		atribut=atributs[atributs.length-1];

		//Primer miro si l'atribut �s consultable
		atribut.mostrar=(atrib_xml.getAttribute('mostrar')=="false") ? "no": "si";

		//descripci�
		tag2=GetXMLChildElementByName(atrib_xml, '*', "descripcio");
		if(tag2 && tag2.hasChildNodes())
			atribut.descripcio=tag2.childNodes[0].nodeValue;
		//nom
		tag2=GetXMLChildElementByName(atrib_xml, '*', "nom");
		if(tag2 && tag2.hasChildNodes())
			atribut.nom=tag2.childNodes[0].nodeValue;
		//unitats
		tag2=GetXMLChildElementByName(atrib_xml, '*', "unitats");				
		if(tag2 && tag2.hasChildNodes())
			atribut.unitats=tag2.childNodes[0].nodeValue;
		//separador
		tag2=GetXMLChildElementByName(atrib_xml, '*', "separador");												
		if(tag2 && tag2.hasChildNodes())
		{				
			atribut.separador=tag2.childNodes[0].nodeValue;
			atribut.separador=CanviaRepresentacioCaractersProhibitsXMLaCaractersText(atribut.separador);		   
		}
		//es link
		tag2=GetXMLChildElementByName(atrib_xml, '*', "esLink");				
		if(tag2 && tag2.hasChildNodes() && tag2.childNodes[0].nodeValue=="true")
			atribut.esLink=true;
		//desc_link
		tag2=GetXMLChildElementByName(atrib_xml, '*', "descLink");				
		if(tag2 && tag2.hasChildNodes())
			atribut.descLink=tag2.childNodes[0].nodeValue;
		//es imatge
		tag2=GetXMLChildElementByName(atrib_xml, '*', "esImatge");				
		if(tag2 && tag2.hasChildNodes() && tag2.childNodes[0].nodeValue=="true")
			atribut.esImatge=true;
		//valor
		tag2=GetXMLChildElementByName(atrib_xml, '*', "valor");
		if(tag2 && tag2.hasChildNodes())
			feature.properties[atribut.nom ? atribut.nom : i]=tag2.childNodes[0].nodeValue;
	}
}

function OmpleAtributsObjecteCapaDigiDesDeGeoJSON(objecte_json, atributs, feature)
{

	if (!objecte_json.properties || CountPropertiesOfObject(objecte_json.properties)==0)
		return;

	feature.properties=objecte_json.properties;
}


function OmpleAtributsObjecteCapaDigiDesDeGeoJSONDeSOS(objecte_json, capa, feature)
{

	if (!objecte_json.result)
		return;
	
	if(objecte_json.type=="http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_ComplexObservation" && objecte_json.result.type=="DataRecord")
	{
		if(objecte_json.result.field && objecte_json.result.field.length>0)
		{			
			if (!feature.properties)
				feature.properties={};
			for(var i=0;i<objecte_json.result.field.length;i++)
			{
				if(objecte_json.result.field[i].name)
					feature.properties[objecte_json.result.field[i].name]=objecte_json.result.field[i].value;
			}
		}
	}
	else if(objecte_json.observedProperty)// �s un tipus simple
	{		
		var prefix_valor=capa.namespace + "/" + capa.nom + "/observableProperty/";
		var property_name=objecte_json.observedProperty.substring(prefix_valor.length);
		if (!feature.properties)
			feature.properties={};
		feature.properties[property_name]=objecte_json.result.value;
	}
	//Ara el temps:
	if(objecte_json.phenomenonTime)
	{
		if (!feature.properties)
			feature.properties={};
		feature.properties.__om_time__=objecte_json.phenomenonTime;
	}
	//Ara el sensor:
	if(objecte_json.procedure)
	{
		var prefix_valor=capa.namespace + "/" + capa.nom + "/procedure/";
		var property_name=objecte_json.procedure.substring(prefix_valor.length);
		if (!feature.properties)
			feature.properties={};
		feature.properties.__om_sensor__=property_name;
	}	
}

function OmpleAtributsObjecteCapaDigiDesDeSOS(objecte_xml, capa, feature)
{
var valor, tag, tags, property_name, camps, i;

	var om_type=GetXMLChildElementByName(objecte_xml, '*', "type");
	if (om_type)
	{
		valor=om_type.getAttribute('xlink:href');
		if (valor=="http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_ComplexObservation")
		{
			tag=GetXMLChildElementByName(objecte_xml, '*', "result");
			if(tag)
			{
				tag=GetXMLChildElementByName(tag, '*', "DataRecord");
				if (tag)
				{
					var camps = tag.childNodes;
					for(var i_camp=0; i_camp<camps.length; i_camp++)
					{
						if (HasXMLNodeTheRightName(camps[i_camp], '*', "field"))
						{
							property_name=camps[i_camp].getAttribute('name');
							if (property_name && property_name.length)
							{
								tags = camps[i_camp].childNodes;
								for (i=0; i<tags.length; i++)
								{		
									if (HasXMLNodeTheRightName(tags[i], '*', "Text") || 
										HasXMLNodeTheRightName(tags[i], '*', "Count") ||
										HasXMLNodeTheRightName(tags[i], '*', "Quantity"))
									{
										tag=GetXMLChildElementByName(tags[i], '*', "value");
										if(tag && tag.hasChildNodes())
										{
											if (!feature.properties)
												feature.properties={};
											
											feature.properties[property_name]=tag.childNodes[0].nodeValue;
										}
										break;
									}
								}
							}
						}
					}
				}
			}
		}
		else
		{
			property_name=DonamElementsNodeAPartirDelNomDelTag(objecte_xml, "http://www.opengis.net/om/2.0", "om", "observedProperty");
			if (property_name && property_name.length>0)
			{
				valor=property_name[0].getAttribute('xlink:href');
				if (valor && valor.length)
				{
					var prefix_valor=capa.namespace + "/" + capa.nom + "/observableProperty/";
					property_name=valor.substring(prefix_valor.length);
					tag=DonamElementsNodeAPartirDelNomDelTag(objecte_xml, "http://www.opengis.net/om/2.0", "om", "result");
					if(tag && tag.length>0 && tag[0].hasChildNodes())
					{
						if (!feature.properties)
							feature.properties={};
						feature.properties[property_name]=tag[0].childNodes[0].nodeValue;
					}
				}
			}
		}
	}
	//Ara el temps:
	tag=GetXMLChildElementByName(objecte_xml, '*', "timePosition");
	if(tag)
	{
		if (!feature.properties)
			feature.properties={};
		feature.properties.__om_time__=tag.childNodes[0].nodeValue;
	}
	//Ara el sensor:
	tag=GetXMLChildElementByName(objecte_xml, '*', "procedure");
	if(tag)
	{
		valor=tag.getAttribute('xlink:href');
		if (valor)
		{
			var prefix_valor=capa.namespace + "/" + capa.nom + "/procedure/";
			property_name=valor.substring(prefix_valor.length);
			if (!feature.properties)
				feature.properties={};
			feature.properties.__om_sensor__=property_name;
		}
	}
}//Fi de OmpleAtributsObjecteCapaDigiDesDeSOS()

function OmpleAtributsObjecteCapaDigiDesDeObservacionsDeSTA(obs, feature, data)
{
	feature.properties=ExtreuTransformaSTAObservations(obs, data);
}

function ErrorCapaDigiAmbPropietatsObjecteDigitalitzat(doc, consulta)
{
	removeLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj));
	NConsultesDigiZero++;
	CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
}

function OmpleCapaDigiAmbPropietatsObjecteDigitalitzat(doc, consulta)
{
var root, id_obj_buscat, i_obj, capa, tipus, valor, features, objectes, objecte_xml, foi_xml;

	if(!doc) 
	{	 
		removeLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj));
		NConsultesDigiZero++;
		CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
		return;
	}
	capa=ParamCtrl.capa[consulta.i_capa];
	if (capa.FormatImatge!="application/json")
	{
		root=doc.documentElement;	
	
		if(!root)
		{
			removeLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj));
			NConsultesDigiZero++;
			CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
			return;	
		}
	}
	
	features=capa.objectes.features;
	tipus=DonaTipusServidorCapa(capa);		

	if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features")
	{
		id_obj_buscat=features[consulta.i_obj].id;
		if (capa.FormatImatge=="application/json")
		{
			objectes=null;
			//try {
				//var geojson=JSON.parse(doc);
				//si hi ha una bbox es podria actualitzar per� com que no la uso...
				objectes=doc.features;
			/*} 
			catch (e) {
				removeLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj));
				NConsultesDigiZero++;
				CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
				return;	
			}*/
			if(objectes && objectes.length>0)
			{
				for(i_obj=0; i_obj<objectes.length; i_obj++)
				{
					//objectes[i_obj].id=objectes[i_obj].id.substring(capa.nom.length+1); NJ no s� perqu� serveix aix�
					if(id_obj_buscat==objectes[i_obj].id)
					{
						OmpleAtributsObjecteCapaDigiDesDeGeoJSON(objectes[i_obj], capa.atributs, capa.objectes.features[consulta.i_obj]);
						break;
					}
				}
			}
		}
		else
		{
			objectes=root.getElementsByTagName(capa.nom);
			if(objectes && objectes.length>0)
			{
				for(i_obj=0; i_obj<objectes.length; i_obj++)
				{
					//Agafo l'identificador del punt i miro si coincideix amb el de l'objecte que estic buscant.
					//els objectes estan ordenats per "id"
					valor=objectes[i_obj].getAttribute('gml:id');
					if (valor)
					{
						valor=valor.substring(capa.nom.length+1); //elimino el nom de la capa de l'id.
						if(id_obj_buscat==valor)
						{
							OmpleAtributsObjecteCapaDigiDesDeWFS(objectes[i_obj], capa.atributs, capa.objectes.features[consulta.i_obj]);
							break;
						}
					}															
				}
			}
		}
	}
	else if (capa.tipus=="TipusSOS")
	{
		var prefix_foi=capa.namespace + "/" + capa.nom + "/featureOfInterest/";
		id_obj_buscat=prefix_foi + features[consulta.i_obj].id;
		if (capa.FormatImatge=="application/json")
		{
			objectes=null;			
			//try {
				//var geojson=JSON.parse(doc);
				//si hi ha una bbox es podria actualitzar per� com que no la uso...
				objectes=doc.observations;
			/*} 
			catch (e) {
				removeLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj));
				NConsultesDigiZero++;
				CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
				return;	
			}*/
			if(objectes && objectes.length>0)
			{
				for(i_obj=0; i_obj<objectes.length; i_obj++)
				{
					objectes[i_obj].featureOfInterest=objectes[i_obj].featureOfInterest.substring(prefix_foi.length); //elimino el prefix de l'id.
					if(id_obj_buscat==objectes[i_obj].featureOfInterest)
					{
						OmpleAtributsObjecteCapaDigiDesDeGeoJSONDeSOS(objectes[i_obj], capa, capa.objectes.features[consulta.i_obj]);
						break;
					}					
				}
			}			
		}
		else
		{
			objectes=DonamElementsNodeAPartirDelNomDelTag(root, "http://www.opengis.net/om/2.0", "om", "OM_Observation");
			if(objectes && objectes.length>0)
			{
				for(i_obj=0; i_obj<objectes.length; i_obj++)
				{
					objecte_xml=objectes[i_obj];
					foi_xml=GetXMLChildElementByName(objecte_xml, '*', "featureOfInterest");
					if (foi_xml)
					{
						valor=foi_xml.getAttribute('xlink:href');
						if(id_obj_buscat==valor)
						{
							OmpleAtributsObjecteCapaDigiDesDeSOS(objecte_xml, capa, capa.objectes.features[consulta.i_obj]);
							break;
						}
					}
				}
			}
		}
	}
	else if (capa.tipus=="TipusSTA" || capa.tipus=="TipusSTAplus")
	{
		id_obj_buscat=features[consulta.i_obj].id;
		objectes=null;			
		//try {
		//	var geojson=JSON.parse(doc);
			//si hi ha una bbox es podria actualitzar per� com que no la uso...
		/*} 
		catch (e) {
			removeLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj));
			NConsultesDigiZero++;
			CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
			return;	
		}*/
		if(doc)
		{
			if(id_obj_buscat==doc["@iot.id"])
				OmpleAtributsObjecteCapaDigiDesDeObservacionsDeSTA(doc.Observations, capa.objectes.features[consulta.i_obj], capa.data);
		}			
	}

	if (!capa.objectes || !capa.objectes.features || 
		!capa.objectes.features[consulta.i_obj].properties || CountPropertiesOfObject(capa.objectes.features[consulta.i_obj].properties)==0)
	{
		removeLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj));
		NConsultesDigiZero++;
	}
	else 
	{
		var text_resposta=MostraConsultaCapaDigitalitzadaComHTML(consulta.i_capa, consulta.i_obj, true, true)
		if(!text_resposta || text_resposta=="")
		{			
			removeLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj));
			NConsultesDigiZero++;
		}
		else		
		{
			contentLayer(getLayer(consulta.win, "LayerObjDigiConsulta"+consulta.i_capa+"_"+consulta.i_obj), text_resposta);
		}
	}
	CanviaEstatEventConsola(null, consulta.i_event, EstarEventTotBe);
}

function DescarregaPropietatsCapaDigiVistaSiCalCallBack(doc, consulta)
{
var capa_digi=ParamCtrl.capa[consulta.param.i_capa];

	//Carrega la informaci� sobre els objectes consultats
	if (0==OmpleCapaDigiAmbPropietatsObjectes(doc, consulta))
		var retorn=consulta.funcio(consulta.param);
	else
		return false;

	if (consulta.param.intencions && consulta.param.intencions=="qualitat")
	{
		if (retorn)
		{
			alert(DonaCadenaLang({"cat": "El par�metre de qualitat calculat est� disponible a la entrada de men� contextual 'qualitat' de la capa", 
						"spa": "El par�metro de calidad calculado est� disponible en la entrada de men� contextual 'calidad' de la capa", 
						"eng": "The calculated quality parameter is available as an entry in the context menu entry 'quality' of the layer", 
						"fre": "The calculated quality parameter is available as an entry in the context menu entry 'quality' of the layer"}) + " " +
				(capa_digi.desc ? DonaCadenaLang(capa_digi.desc) : capa_digi.nom));
			TancaFinestraLayer('calculaQualitat');
		}
		else
		{
			alert(DonaCadenaLang({"cat": "No s'ha pogut calcular la qualitat de la capa", 
						"spa": "No se ha podido calcular la calidad de la capa", 
						"eng": "The quality cannot be computed for the layer", 
						"fre": "The quality cannot be computed for the layer"}) + " " +
				(capa_digi.desc ? DonaCadenaLang(capa_digi.desc) : capa_digi.nom));
		}
	}
}

function ErrorDescarregaPropietatsCapaDigiVistaSiCalCallBack(doc, consulta)
{
	CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
}

//var secondTime=false;

//Retorna false si no cal o si no es pot. Retorno true si he iniciat un proc�s assincron per descarregar.
function DescarregaPropietatsCapaDigiVistaSiCal(funcio, param)
{
var capa=ParamCtrl.capa[param.i_capa], i_event, url, j, punt={}, tipus, env=ParamInternCtrl.vista.EnvActual;

	if (!capa.tipus //els objectes empotrats no poden obtenir les properties si no hi s�n
		|| !capa.objectes || !capa.objectes.features)  //falten massa coses que hi hauria d'haver
		return false;  

	/*if (secondTime)
		return false;
	secondTime=true;*/
	tipus=DonaTipusServidorCapa(capa);
	for (j=0; j<capa.objectes.features.length; j++)
	{	
		//Nom�s v�lid per a fitxers de punts.			
		DonaCoordenadaPuntCRSActual(punt, capa.objectes.features[j], capa.CRSgeometry);
		if (env.MinX < punt.x &&
			env.MaxX > punt.x &&
			env.MinY < punt.y &&
			env.MaxY > punt.y)
		{
			if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features")
			{
				if (CountPropertiesOfObject(capa.objectes.features[j].properties)<=DonaNombrePropietatsSimbolitzacio(param.i_capa))  //Nom�s hi ha les propietats de simbolitzaci� actuals carregades
					break;
			}
			else //if (tipus=="TipusSOS" || tipus=="TipusSTA" || tipus=="TipusSTAplus")
			{
				if (CountPropertiesOfObject(capa.objectes.features[j].properties)==0)  //No hi ha propietats carregades
					break;
			}
		}
	}
	if (j==capa.objectes.features.length)
		return false; //no hi ha cap objecte que li faltin les properties.
	if (tipus=="TipusWFS")
	{
		url=DonaRequestGetFeature(param.i_capa, ParamInternCtrl.vista.EnvActual, null, true);
		i_event=CreaIOmpleEventConsola("GetFeature", param.i_capa, url, TipusEventGetFeature);
	}
	else if (tipus=="TipusOAPI_Features")
	{
		url=DonaRequestGetFeature(param.i_capa, ParamInternCtrl.vista.EnvActual, null, true);
		i_event=CreaIOmpleEventConsola("OAPI_Features", param.i_capa, url, TipusEventGetFeature);
	}
	else if (tipus=="TipusSOS")
	{
		url=DonaRequestGetObservation(param.i_capa, null, ParamInternCtrl.vista.EnvActual);
		i_event=CreaIOmpleEventConsola("GetObservation", param.i_capa, url, TipusEventGetObservation);
	}
	else //if (tipus=="TipusSTA" || tipus=="TipusSTAplus")
	{
		url=DonaRequestSTAObservationsFeatureOfInterest(param.i_capa, null, ParamInternCtrl.vista.EnvActual);
		i_event=CreaIOmpleEventConsola("STA Observations", param.i_capa, url, TipusEventGetObservation);
	}
	if (capa.FormatImatge=="application/json" || tipus=="TipusSTA" || tipus=="TipusSTAplus")
		loadJSON(url, DescarregaPropietatsCapaDigiVistaSiCalCallBack, ErrorDescarregaPropietatsCapaDigiVistaSiCalCallBack, {funcio: funcio, param: param, i_event: i_event});
	else
		loadFile(url, (capa.FormatImatge) ? capa.FormatImatge : "text/xml", DescarregaPropietatsCapaDigiVistaSiCalCallBack, ErrorDescarregaPropietatsCapaDigiVistaSiCalCallBack, {funcio: funcio, param: param, i_event: i_event});
	return true;
}

/*function OmpleCapaDigiAmbPropietatsObjectesText(doc, consulta)
{
var root, i_obj, capa, valor, s, ini, fi, observation;

	s=doc;
	while (true)
	{
		ini=s.length;
		ini=s.indexOf(":OM_Observation ")
		if (ini==-1)
			break;
		fi=s.indexOf("OM_Observation>")
		observation=s.slice(ini, fi);
		s=s.slice(fi+1);
	}
	CanviaEstatEventConsola(null, consulta.i_event, EstarEventTotBe);
	return 0;
}
*/

function OmpleCapaDigiAmbPropietatsObjectes(doc, consulta)
{
var root, capa, features, valor, tipus, i_obj;

	if(!doc) 
	{	 
		CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
		return 1;
	}
	capa=ParamCtrl.capa[consulta.param.i_capa];
	if (capa.FormatImatge!="application/json")
	{
		root=doc.documentElement;	
	
		if(!root)
		{
			CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
			return 1;	
		}
	}
	features=capa.objectes.features;
	tipus=DonaTipusServidorCapa(capa);
	if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features")
	{
		if (capa.FormatImatge=="application/json")
		{
			var objectes=null;
			//try {
			//	var geojson=JSON.parse(doc);
				//si hi ha una bbox es podria actualitzar per� com que no la uso...
				objectes=doc.features;
			/*} 
			catch (e) {
				CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
				return;
			}*/
			if(objectes && objectes.length>0)
			{
				for(var i_obj_llegit=0; i_obj_llegit<objectes.length; i_obj_llegit++)
				{
					// objectes[i_obj_llegit].id=objectes[i_obj_llegit].id.substring(capa.nom.length+1); NJ no s� perqu� serveix aix�
					i_obj=features.binarySearch(objectes[i_obj_llegit], ComparaObjCapaDigiIdData);
					if (i_obj>=0)
						OmpleAtributsObjecteCapaDigiDesDeGeoJSON(objectes[i_obj_llegit], capa.atributs, features[i_obj]);
				}
			}
		}
		else
		{
			var objectes=root.getElementsByTagName(capa.nom);
			if(objectes && objectes.length>0)
			{
				for(var i_obj_llegit=0; i_obj_llegit<objectes.length; i_obj_llegit++)
				{
					//Agafo l'identificador del punt i miro si coincideix amb el de l'objecte que estic buscant.
					//els objectes estan ordenats per "id"
					valor=objectes[i_obj_llegit].getAttribute('gml:id');
					if (valor)
					{
						valor=valor.substring(capa.nom.length+1); //elimino el nom de la capa de l'id.
						i_obj=features.binarySearch({"id":valor}, ComparaObjCapaDigiIdData);
						if (i_obj>=0)
							OmpleAtributsObjecteCapaDigiDesDeWFS(objectes[i_obj_llegit], capa.atributs, features[i_obj]);
					}										
				}
			}
		}
	}
	else if (capa.tipus=="TipusSOS")
	{
		if (capa.FormatImatge=="application/json")
		{
			var objectes=null;
			var prefix_foi=capa.namespace + "/" + capa.nom + "/featureOfInterest/";
			//try {
			//	var geojson=JSON.parse(doc);
				//si hi ha una bbox es podria actualitzar per� com que no la uso...
				objectes=doc.observations;
			/*} 
			catch (e) {
				CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
				return;
			}*/
			if(objectes && objectes.length>0)
			{
				for(var i_obj_llegit=0; i_obj_llegit<objectes.length; i_obj_llegit++)
				{
					objectes[i_obj_llegit].featureOfInterest=objectes[i_obj_llegit].featureOfInterest.substring(prefix_foi.length); //elimino el prefix de l'id.
					i_obj=features.binarySearch({"id":objectes[i_obj_llegit].featureOfInterest}, ComparaObjCapaDigiIdData);
					if (i_obj>=0)
						OmpleAtributsObjecteCapaDigiDesDeGeoJSONDeSOS(objectes[i_obj_llegit], capa, features[i_obj]);
				}
			}
		}
		else
		{
			var prefix_foi=capa.namespace + "/" + capa.nom + "/featureOfInterest/";
			var objectes=DonamElementsNodeAPartirDelNomDelTag(root, "http://www.opengis.net/om/2.0", "om", "OM_Observation");
			if(objectes && objectes.length>0)
			{
				for(var i_obj_llegit=0; i_obj_llegit<objectes.length; i_obj_llegit++)
				{
					var objecte_xml=objectes[i_obj_llegit];
					var foi_xml=GetXMLChildElementByName(objecte_xml, '*', "featureOfInterest");
					if (foi_xml)
					{
						valor=foi_xml.getAttribute('xlink:href');
						if (valor)
						{
							valor=valor.substring(prefix_foi.length); //elimino el prefix de l'id.
							i_obj=features.binarySearch({"id":valor}, ComparaObjCapaDigiIdData);
							if (i_obj>=0)
								OmpleAtributsObjecteCapaDigiDesDeSOS(objecte_xml, capa, features[i_obj], capa.data);	
						}
					}
				}
			}
		}
	}
	else if (capa.tipus=="TipusSTA" || capa.tipus=="TipusSTAplus")
	{
		/*try {
			var geojson=JSON.parse(doc);
			//si hi ha una bbox es podria actualitzar per� com que no la uso...
		} 
		catch (e) {
			CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
			return;
		}*/
		if(doc && doc.length>0)
		{
			for(var i_obj_llegit=0; i_obj_llegit<doc.length; i_obj_llegit++)
			{
				i_obj=features.binarySearch({"id":doc[i_obj_llegit]["@oit.id"]}, ComparaObjCapaDigiIdData);
				if (i_obj>=0)
					OmpleAtributsObjecteCapaDigiDesDeObservacionsDeSTA(doc[i_obj_llegit].Observations, features[i_obj], capa.data);
			}
		}
	}
	CanviaEstatEventConsola(null, consulta.i_event, EstarEventTotBe);
	return 0;
}// Fi de OmpleCapaDigiAmbPropietatsObjectes()

function AddPropertyAndTime(prop, uom, time, value)
{
var key;
	if ((!uom.name || uom.name=="n/a") && uom.definition)
	{
		if (uom.definition.lastIndexOf("/")>0)
			key=uom.definition.substring(uom.definition.lastIndexOf("/")+1);
		else
			key=uom.definition;
	}
	else if (!uom.name)
		key="name";
	else
	{
		key=uom.name;
		for (var i=0; i<key.length; i++)
		{
			if (!isalnum(key.charAt(i)))
				key=key.substring(0, i) + "_" + key.substring(i+1);
		}
	}
	/*if (time)  //Mirar b� com s'ha de fer.
		prop[key+time]=value;
	else*/
		prop[key]=value;
}

function ExtreuTransformaSTAObservations(obs, data_capa)
{
var ob, prop={};

	for (var i=0; i<obs.length; i++)
	{
		ob=obs[i];
		if (ob.phenomenonTime)
		{
			prop["time"]=ob.phenomenonTime;
			//InsereixDataISOaCapa(ob.phenomenonTime, data_capa);
		}
		if (ob.MultiDatastream)
		{
			for (var j=0; j<ob.MultiDatastream.unitOfMeasurements.length; j++)
				AddPropertyAndTime(prop, ob.MultiDatastream.unitOfMeasurements[j], ob.phenomenonTime, ob.result[j]);
			prop["thing"]=ob.MultiDatastream.Thing.name;
			prop["party"]=ob.MultiDatastream.Party.name;
			prop["project"]=ob.MultiDatastream.Project.name;
			prop["license"]=ob.MultiDatastream.License.description;
		}
		else // if (ob.Datastream)
		{
			AddPropertyAndTime(prop, ob.Datastream.unitOfMeasurement, ob.phenomenonTime, ob.result);
			prop["thing"]=ob.Datastream.Thing.name;
			prop["party"]=ob.Datastream.Party.name;
			prop["project"]=ob.Datastream.Project.name;
			prop["license"]=ob.Datastream.License.description;
		}
	}
	return prop;
}

function ExtreuITransformaSTAfeatures(fois)
{
var features=[], foi;
	for (var i=0; i<fois.value.length; i++)
	{
		foi=fois.value[i];
		features.push({type: "Feature", 
				id: foi["@iot.id"], 
				geometry: foi.feature, 
				//properties: ExtreuTransformaSTAObservations(foi.Observations)}
				properties: []});
	}
	return features;
}


//Els objectes es mantene en mem�ria ordenats per id. Aix� es fa servir per afegir atributs als objectes m�s endavant.
function OmpleCapaDigiAmbObjectesDigitalitzats(doc, consulta)
{
var root, tag, punt={}, objectes, valor, capa, feature, hi_havia_objectes, tipus;

	//Agafo tots els nodes que tenen per nom el nom de la capa, cada un d'ells ser� un punt	
	if(!doc) 
	{
		CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
		return;
	}

	capa=ParamCtrl.capa[consulta.i_capa_digi];
	tipus=DonaTipusServidorCapa(capa);
	if (capa.FormatImatge=="application/json")
	{
		if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features" || tipus=="TipusSOS" || tipus=="TipusSTA" || tipus=="TipusSTAplus")
		{
			if (capa.objectes && capa.objectes.features)
			{
				hi_havia_objectes=true;
				//try {
					//var geojson=JSON.parse(doc);
					//si hi ha una bbox es podria actualitzar per� com que no la uso...
					if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features")
						var features=doc.features;
					else if (tipus=="TipusSOS")
						var features=doc.featureOfInterest;
					else if (tipus=="TipusSTA" || tipus=="TipusSTAplus")
						var features=ExtreuITransformaSTAfeatures(doc);
					if(features.length>0)
					{
						/*NJ no s� perqu� serveix aix�
						for (i=0; i<features.length; i++)
							features[i].id=features[i].id.substring(capa.nom.length+1); */
						capa.objectes.features.push.apply(capa.objectes.features, features);  //Millor no usar concat. Extret de: https://jsperf.com/concat-vs-push-apply/10
					}
				/*} 
				catch (e) {
					CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
					return;
				}*/
			}
			else
			{
				hi_havia_objectes=false;
				//try {
					if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features")
					{
						//capa.objectes=JSON.parse(doc);
						capa.objectes=doc;
					}
					if (tipus=="TipusSOS")
					{
						//var geojson=JSON.parse(doc);					
						capa.objectes={"type": "FeatureCollection", "features": doc.featureOfInterest};
					}
					else if (tipus=="TipusSTA" || tipus=="TipusSTAplus")
					{
						//var geojson=JSON.parse(doc);					
						var features=ExtreuITransformaSTAfeatures(doc);
						capa.objectes={"type": "FeatureCollection", "features": features};
					}
					/*NJ no s� perqu� serveix aix�
					var features=capa.objectes.features;
					for (i=0; i<features.length; i++)
						features[i].id=features[i].id.substring(capa.nom.length+1);*/
				/*} 
				catch (e) {
					CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
					return;
				}*/
			}
		}
		else
		{
			CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
			return;
		}
	}
	else
	{
		root=doc.documentElement;
		if(!root)
		{
			CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
			return;
		}

		if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features")
		{
			if(!capa.namespace || capa.namespace==null)
			{
				var ns;
				var atributs=root.attributes;
				if(atributs)
					ns=atributs.getNamedItem("xmlns");
				if(ns)
					capa.namespace=ns.value;
			}
			objectes=root.getElementsByTagName(capa.nom);
		}
		else if (tipus=="TipusSOS")
			objectes=DonamElementsNodeAPartirDelNomDelTag(root, "http://www.opengis.net/samplingSpatial/2.0", "sams", "SF_SpatialSamplingFeature");
		else
		{
			CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
			return;
		}

		if(objectes && objectes.length>0)
		{
			if (capa.objectes && capa.objectes.features)
				hi_havia_objectes=true;
			else
			{
				capa.objectes={"type": "FeatureCollection", "features": []};
				hi_havia_objectes=false;
			}
			for(var i_obj=0; i_obj<objectes.length; i_obj++)
			{
				//Agafo l'identificador del punt i creo l'objecte dins de la Capa
				valor=objectes[i_obj].getAttribute('gml:id');
				valor=valor.substring(capa.nom.length+1); //elimino el nom de la capa de l'id.
				feature=capa.objectes.features[capa.objectes.features.push({
									"id": valor,
									"geometry": {
										"type": "Point",
										"coordinates": [0.0, 0.0]
									},
									"properties": {},
									"seleccionat": (consulta.seleccionar? true : false)
								})-1];
				
				if(objectes[i_obj].hasChildNodes)
				{
					//Agafo la posici� dels objectes
					tag=DonamElementsNodeAPartirDelNomDelTag(objectes[i_obj], "http://www.opengis.net/gml", "gml", "pos");
					if(tag.length>0)
					{
						//cal_crear_vista=true;
						valor=tag[0].childNodes[0].nodeValue;
						var coord=valor.split(" ");
						if (CalGirarCoordenades(ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS, null))  // �$� NJ-> JM Crec que aix� no est� b�, perqu� les coordenades en el cas del SOS s�n de moment sempre en EPGS:4326 i  no en el sistema de sistuaci� acutal
						{
							feature.geometry.coordinates[0]=parseFloat(coord[1]);
							feature.geometry.coordinates[1]=parseFloat(coord[0]);
						}
						else
						{
							feature.geometry.coordinates[0]=parseFloat(coord[0]);
							feature.geometry.coordinates[1]=parseFloat(coord[1]);
						}
						CanviaCRSITransformaCoordenadesCapaDigi(capa, ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS);
						if(consulta.seleccionar==true)
						{
							//Actualitzar EnvSelec, que sempre est� en el sistema de coordenades actual
							DonaCoordenadaPuntCRSActual(punt, feature, capa.CRSgeometry);
							if(EnvSelec==null)
								EnvSelec={"MinX": punt.x, "MaxX": punt.x, "MinY": punt.y, "MaxY": punt.y};
							else
							{						
								if(punt.x<EnvSelec.MinX)
									EnvSelec.MinX=punt.x;
								if(punt.x>EnvSelec.MaxX)
									EnvSelec.MaxX=punt.x;
								if(punt.y<EnvSelec.MinY)
									EnvSelec.MinY=punt.y;
								if(punt.y>EnvSelec.MaxY)
									EnvSelec.MaxY=punt.y;
							}	
						}
					}
	
					if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features")
					{
						//ara els atributs
						OmpleAtributsObjecteCapaDigiDesDeWFS(objectes[i_obj], capa.atributs, feature);
					}
					//ara el i_simbol
					//DeterminaISimbolObjecteCapaDigi(capa, i_obj);
				}		
			}
			CarregaSimbolsEstilActualCapaDigi(capa);
		}
	}
	if (capa.objectes && capa.objectes.features && capa.objectes.features.length==0)
		capa.objectes=null;
		
	if (capa.objectes && capa.objectes.features)
	{
		//Elimino els objectes que han estat carregats m�s d'un cop. Aix� pot passar en usar tiles.
		var features=capa.objectes.features;
		features.sort(ComparaObjCapaDigiIdData);
		if (hi_havia_objectes)
		{
			var anterior=features[0].id;
			var i=1;
			while(i<features.length)
			{
				if(anterior==features[i].id)
					features.splice(i,1);
				else
				{
					anterior=features[i].id;
					i++;
				}
			}
		}
	}

	CanviaCRSITransformaCoordenadesCapaDigi(capa, ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS);

	if(consulta.i_tile!=-1)
		capa.TileMatrixGeometry.tiles_solicitats[consulta.i_tile]="TileRebut";
	/*if(consulta.seleccionar==false && cal_crear_vista)
		CreaVistes(); Ara el redibuixat es fa en el canvas quan totes les tiles han finalitzat i no cal for�ar-lo a cada tile mai.*/
	CanviaEstatEventConsola(null, consulta.i_event, EstarEventTotBe);
	if(consulta.funcio)
		consulta.funcio(consulta.param);

}//Fi de OmpleCapaDigiAmbObjectesDigitalitzats()

function ErrorCapaDigiAmbObjectesDigitalitzats(doc, consulta)
{
	CanviaEstatEventConsola(null, consulta.i_event, EstarEventError);
}//Fi de ErrorCapaDigiAmbObjectesDigitalitzats()

//Dona l'index dins de l'array d'atributs d'un nom d'attribut
function DonaIAtributsDesDeNomAtribut(capa_digi, nom_atribut)
{
	for(var i=0; i<capa_digi.atributs.length; i++)
	{
		if(!capa_digi.atributs[i].nom)
		{
			alert("The "+i+" attribute of the layer "+capa_digi.nom+" has no name.");
			return -1;
		}
		if(capa_digi.atributs[i].nom.toUpperCase()==nom_atribut.toUpperCase())
			return i;
	}
	return -1;
}

//Determina el valor per una data concreta. Pensada per muntar series temporals
function DeterminaValorAtributObjecteDataCapaDigi(i_nova_vista, capa, i_obj_capa, i_atrib, i_data, i_col, i_fil)
{
	if (capa.atributs[i_atrib].calcul && !capa.atributs[i_atrib].FormulaConsulta)
	{
		alert("Irregular situation in the code. This needs to be solved in the feature collection level.");
		return 0;
	}
	
	if (capa.atributs[i_atrib].FormulaConsulta)  
	{
		var p=capa.objectes.features[i_obj_capa].properties;  //Encara que sembla que no es fa servir, aquesta variable �s necessaria pels evals()
		var nonPropId=capa.objectes.features[i_obj_capa].id;
		if (HiHaValorsNecessarisCapaFormulaconsulta(capa, capa.atributs[i_atrib].FormulaConsulta))
			var v=DonaValorsDeDadesBinariesCapa(i_nova_vista, capa, null, i_col, i_fil); //idem
		return eval(CanviaVariablesDeCadena(capa.atributs[i_atrib].FormulaConsulta, capa, i_data));
	}
	if (capa.atributs[i_atrib].nom=="nonPropId")
		return capa.objectes.features[i_obj_capa].id;
	return capa.objectes.features[i_obj_capa].properties[CanviaVariablesDeCadena(capa.atributs[i_atrib].nom, capa, i_data)];
}

//Determina el valor per la data actual
function DeterminaValorAtributObjecteCapaDigi(i_nova_vista, capa, i_obj_capa, i_atrib, i_col, i_fil)
{
	return DeterminaValorAtributObjecteDataCapaDigi(i_nova_vista, capa, i_obj_capa, i_atrib, null, i_col, i_fil)
}

function DeterminaTextValorAtributObjecteCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_atrib, i_col, i_fil)
{
	return DeterminaTextValorAtributObjecteDataCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_atrib, null, i_col, i_fil);
}

function DeterminaTextValorAtributObjecteDataCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_atrib, i_data, i_col, i_fil)
{
	var valor=DeterminaValorAtributObjecteDataCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_atrib, i_data, i_col, i_fil);
	if (capa_digi.atributs[i_atrib].NDecimals || capa_digi.atributs[i_atrib].NDecimals===0)
		return OKStrOfNe(valor, capa_digi.atributs[i_atrib].NDecimals);
	return valor;
}

function AlertaNomAtributIncorrecteSimbolitzar(nom_camp, text_nom_camp, capa_digi)
{
	alert(DonaCadenaLang({"cat": "Nom d'atribut incorrecte", 
				"spa": "Nom de atributo incorrecto", 
				"eng": "Wrong attribute name",
				"fre": "Nom d'attribut incorrect"}) + 
				" " +
				nom_camp + " (" + text_nom_camp + ") " +
				DonaCadenaLang({"cat": "per simbolitzar la capa", 
						"spa": "para simbolizar la capa", 
						"eng": "to symbolize the layer", 
						"fre": "por symboliser la couche"}) + " " +
				(capa_digi.desc ? capa_digi.desc : capa_digi.nom));
}

function DeterminaValorObjecteCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_simbs, i_col, i_fil, nom_camp)
{
var estil, i_atrib;
	if(capa_digi.estil && capa_digi.estil.length && nom_camp &&
		capa_digi.objectes.features[i_obj_capa].properties &&
		CountPropertiesOfObject(capa_digi.objectes.features[i_obj_capa].properties)>0)
	{
		estil=capa_digi.estil[capa_digi.i_estil];
		i_atrib=DonaIAtributsDesDeNomAtribut(capa_digi, nom_camp);
		if (i_atrib==-1)
		{
			AlertaNomAtributIncorrecteSimbolitzar(nom_camp, "NomCamp*", capa_digi);
			return 0;
		}
		return DeterminaValorAtributObjecteCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_atrib, i_col, i_fil);
	}
	return 0;
}

function DeterminaTextValorObjecteCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_simbs, i_col, i_fil, nom_camp)
{
var estil, i_atrib;
	if(capa_digi.estil && capa_digi.estil.length && nom_camp &&
		capa_digi.objectes.features[i_obj_capa].properties &&
		CountPropertiesOfObject(capa_digi.objectes.features[i_obj_capa].properties)>0)
	{
		estil=capa_digi.estil[capa_digi.i_estil];
		i_atrib=DonaIAtributsDesDeNomAtribut(capa_digi, nom_camp);
		if (i_atrib==-1)
		{
			AlertaNomAtributIncorrecteSimbolitzar(nom_camp, "NomCamp*", capa_digi);
			return 0;
		}
		return DeterminaTextValorAtributObjecteCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_atrib, i_col, i_fil);
	}
	return 0;
}

function DeterminaISimbolObjecteCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_simbs, i_col, i_fil)
{
var i_simbol, estil, valor, i_atrib;
	if(capa_digi.estil && capa_digi.estil.length && 
		capa_digi.estil[capa_digi.i_estil].simbols && capa_digi.estil[capa_digi.i_estil].simbols.length &&
		capa_digi.estil[capa_digi.i_estil].simbols[i_simbs].NomCamp &&
		capa_digi.objectes.features[i_obj_capa].properties &&
		CountPropertiesOfObject(capa_digi.objectes.features[i_obj_capa].properties)>0)
	{
		estil=capa_digi.estil[capa_digi.i_estil];
		i_atrib=DonaIAtributsDesDeNomAtribut(capa_digi, estil.simbols[i_simbs].NomCamp)
		if (i_atrib==-1)
		{
			AlertaNomAtributIncorrecteSimbolitzar(estil.simbols[i_simbs].NomCamp, "estil.simbols[i_simbs].NomCamp", capa_digi);
			return -1;
		}
		valor=DeterminaValorAtributObjecteCapaDigi(i_nova_vista, capa_digi, i_obj_capa, i_atrib, i_col, i_fil);
		for(i_simbol=0; i_simbol<estil.simbols[i_simbs].simbol.length; i_simbol++)
		{
			if(valor==estil.simbols[i_simbs].simbol[i_simbol].ValorCamp)
				return i_simbol;
		}
		return -1;  //The value of the object does not correspond with any simbol
	}
	return 0;  //simbols are not indexed by NomCamp (or there are no properties in the object) so there first simbol should be used
}

//Discusi� de com fer tot aix�: http://stackoverflow.com/questions/17578280/how-to-pass-parameters-into-image-load-event
function EnCarregarSimbolCapaDigi()
{
	this.sha_carregat = true;
}

function EnErrorCarregarSimbolCapaDigi()
{
	this.hi_ha_hagut_error = true;
	alert("Error uploading "+ this.src);
}

function CarregaImatgeIcona(icona)
{
	if (icona.icona)
	{
		icona.img = new Image();
		icona.img.src = AfegeixAdrecaBaseSRC(icona.icona);
		icona.img.ncol = icona.ncol;
		icona.img.nfil = icona.nfil;
		icona.img.sha_carregat = false;
		icona.img.hi_ha_hagut_error = false;
		icona.img.onload = EnCarregarSimbolCapaDigi;
		icona.img.onerror = EnErrorCarregarSimbolCapaDigi;
	}
}

function DescarregaSimbolsCapaDigi(capa)
{
var simbol;
	if (!capa.estil)
		return;
	for (var i_estil=0; i_estil<capa.estil.length; i_estil++)
	{
		if (!capa.estil[i_estil].simbols ||
			!capa.estil[i_estil].simbols.length)
			continue;
		for (var i_simb=0; i_simb<capa.estil[i_estil].simbols.length; i_simb++)
		{
			if (!capa.estil[i_estil].simbols[i_simb].simbol)
				continue;
			simbol=capa.estil[i_estil].simbols[i_simb].simbol;

			for(var i_simbol=0; i_simbol<simbol.length; i_simbol++)
			{
				if (simbol[i_simbol].icona && simbol[i_simbol].icona.img)
					delete simbol[i_simbol].icona.img;
				if (simbol[i_simbol].IconaSel && simbol[i_simbol].IconaSel.img)
					delete simbol[i_simbol].IconaSel.img;
			}
		}
	}
}

function CarregaSimbolsEstilCapaDigi(capa, i_estil, recarrega)
{
var simbol;

	if (!capa.estil || capa.estil.length==0 ||
		!capa.estil[i_estil].simbols)
		return;
	
	if (!Array.isArray(capa.estil[i_estil].simbols))
		alert("New in 2020-03-10. In all 'capa's, \"simbols\" should be an array.");
	 
	for (var i_simb=0; i_simb<capa.estil[i_estil].simbols.length; i_simb++)
	{
		if (!capa.estil[i_estil].simbols[i_simb].simbol)
			continue;

		simbol=capa.estil[i_estil].simbols[i_simb].simbol;

		for(var i_simbol=0; i_simbol<simbol.length; i_simbol++)
		{
			if (simbol[i_simbol].icona)
			{
				if(recarrega || !simbol[i_simbol].icona.img)
					CarregaImatgeIcona(simbol[i_simbol].icona);
			}
			if (simbol[i_simbol].IconaSel)
			{
				if(recarrega || !simbol[i_simbol].IconaSel.img)
					CarregaImatgeIcona(simbol[i_simbol].IconaSel);
			}
		}
	}
}

function CarregaSimbolsEstilActualCapaDigi(capa)
{
	CarregaSimbolsEstilCapaDigi(capa, capa.i_estil, false);
}

function DonaRequestDescribeFeatureTypeInterna(i, simple)
{
var cdns=[];
var c_afegir="";

	cdns.push("VERSION=",DonaVersioComAText(ParamCtrl.capa[i_capa].versio),"&amp;SERVICE=WFS&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=",
			  (simple ? "text/xml;subtype=gml/3.1.1/profiles/gmlsf/1.0.0/0" : "text/xml;subtype=gml/3.1.1/profiles/miramon/1.0.0/attributes") ,
			  "&amp;SRSNAME=",ParamCtrl.capa[i].CRSgeometry ,"&amp;TYPENAME=" ,ParamCtrl.capa[i].nom);

	return AfegeixNomServidorARequest(DonaServidorCapa(ParamCtrl.capa[i]), cdns.join(""), true, DonaCorsServidorCapa(ParamCtrl.capa[i]));
}//Fi de DonaRequestDescribeFeatureTypeInterna()

function DonaRequestOWSObjectesDigi(i_capa, env, cadena_objectes, completa)
{
var tipus=DonaTipusServidorCapa(ParamCtrl.capa[i_capa]);

	if (tipus=="TipusWFS" || tipus=="TipusOAPI_Features")
		return DonaRequestGetFeature(i_capa, env, cadena_objectes, completa);
	if (tipus=="TipusSOS") 
		return DonaRequestSOSGetFeatureOfInterest(i_capa, env);
	if (tipus=="TipusSTA" || tipus=="TipusSTAplus")
		return DonaRequestSTAFeaturesOfInterest(i_capa, env);

	alert(DonaCadenaLang({"cat":"Tipus de servei suportat", "spa":"Tipo de servicio no suportado", "eng":"Unsupported service type","fre":"Type de service non support�e"}) + ": " + tipus);
	return "";
}

function EsCampCalculat(atributs, nom_camp)
{
	for(var i=0; i<atributs.length; i++)
	{
		if(atributs[i].nom==nom_camp)
		{
			if(atributs[i].FormulaConsulta)
				return i;
			return -1;
		}
	}
	return -1;
}

function DonaNomsCampsCapaDeAtributCalculat(i_capa, formula)
{
var fragment, cadena, inici, final;
var noms_camps=[];

	fragment=formula;
	while(((inici=fragment.indexOf("p[\""))!=-1 || (inici=fragment.indexOf("p['"))!=-1)  && 
		   ((final=fragment.indexOf("\"]"))!=-1 || (final=fragment.indexOf("']"))!=-1))
	{
		cadena=fragment.substring(inici+3, final);
		noms_camps.push(cadena);			
		fragment=fragment.substring(final+2, fragment.length);
	}  	
	return noms_camps;
}

function HiHaSimbolitzacioIndexadaPerPropietats(estil)
{
var simbols;

	if (estil.simbols && estil.simbols.length)
	{
		for (var i_simb=0; i_simb<estil.simbols.length; i_simb++)
		{
			if (estil.simbols[i_simb].NomCamp)
				return true;
			if (estil.simbols[i_simb].NomCampFEscala)
				return true;
		}
	}

	if (estil.NomCampSel || 
		(estil.fonts && estil.fonts.NomCamp))
		return true;

	if (estil.formes && estil.formes.length)
	{
		for (var i_forma=0; i_forma<estil.formes.length; i_forma++)
		{
			if (estil.formes[i_forma].interior && estil.formes[i_forma].interior.NomCamp)
				return true;
			if (estil.formes[i_forma].vora && estil.formes[i_forma].vora.NomCamp)
				return true;
		}
	}
	return false;
}

function DonaNombrePropietatsSimbolitzacio(i_capa)
{
	var llista=DonaLlistaPropietatsSimbolitzacio(i_capa);
	return llista.length;
}

function DonaLlistaPropietatsSimbolitzacio(i_capa)
{
var llista=[], i_calculat, capa=ParamCtrl.capa[i_capa], simbols, forma, estil;
	
	if(capa.estil && capa.estil.length)
	{			
		for(var i=0;i<capa.estil.length; i++)
		{
			estil=capa.estil[i];
			if(estil.simbols && estil.simbols.length)
			{
				for (var i_simb=0; i_simb<estil.simbols.length; i_simb++)
				{
					simbols=estil.simbols[i_simb];
					if(simbols.NomCamp)
					{
						if(-1==(i_calculat=EsCampCalculat(capa.atributs, simbols.NomCamp)))
							llista.push(simbols.NomCamp);
						else
							llista.push.apply(llista, DonaNomsCampsCapaDeAtributCalculat(i_capa, capa.atributs[i_calculat].FormulaConsulta));
					}
					if(simbols.NomCampFEscala)
					{
						if(-1==(i_calculat=EsCampCalculat(capa.atributs, simbols.NomCampFEscala)))
							llista.push(simbols.NomCampFEscala);
						else
							llista.push.apply(llista, DonaNomsCampsCapaDeAtributCalculat(i_capa, capa.atributs[i_calculat].FormulaConsulta));
					}
				}
			}
			if(estil.NomCampSel)			
			{
				if(-1==(i_calculat=EsCampCalculat(capa.atributs, estil.NomCampSel)))
					llista.push(estil.NomCampSel);
				else
					llista.push.apply(llista, DonaNomsCampsCapaDeAtributCalculat(i_capa, capa.atributs[i_calculat].FormulaConsulta));
			}
			if(estil.formes && estil.formes.length)
			{
				for (var i_forma=0; i_forma<estil.formes.length; i_forma++)
				{
					forma=estil.formes[i_forma];
					if(forma.interior && forma.interior.NomCamp)
					{
						if(-1==(i_calculat=EsCampCalculat(capa.atributs, forma.interior.NomCamp)))
							llista.push(forma.interior.NomCamp);
						else
							llista.push.apply(llista, DonaNomsCampsCapaDeAtributCalculat(i_capa, capa.atributs[i_calculat].FormulaConsulta));
					}
					if(forma.vora && forma.vora.NomCamp)
					{
						if(-1==(i_calculat=EsCampCalculat(capa.atributs, forma.vora.NomCamp)))
							llista.push(forma.vora.NomCamp);
						else
							llista.push.apply(llista, DonaNomsCampsCapaDeAtributCalculat(i_capa, capa.atributs[i_calculat].FormulaConsulta));
					}
				}
			}
			if(estil.fonts && estil.fonts.NomCamp)
			{
				if(-1==(i_calculat=EsCampCalculat(capa.atributs, estil.fonts.NomCamp)))
					llista.push(estil.fonts.NomCamp);
				else
					llista.push.apply(llista, DonaNomsCampsCapaDeAtributCalculat(i_capa, capa.atributs[i_calculat].FormulaConsulta));
			}			
		}
	}
	if(llista.length>1)
	{
		//Ordeno i elimino repetits
		llista.sort(sortAscendingStringSensible);
		llista.removeDuplicates(sortAscendingStringSensible);
	}
	return llista;
}

function DonaRequestGetFeature(i_capa, env, cadena_objectes, completa)
{
var cdns=[], c_afegir="", capa=ParamCtrl.capa[i_capa], camps_implicats, i, tipus;

	tipus=DonaTipusServidorCapa(capa);
	if(tipus=="TipusOAPI_Features")	
	{
		var plantilla=[];
		if(capa.URLTemplate)
			plantilla.push(capa.URLTemplate);
		else		
			plantilla.push("/collections/{collectionId}/items");
			
		if(cadena_objectes && cadena_objectes.length==1)  // si n'hi ha m�s caldr� fer-ho d'una altra manera, tot i que crec que de moment mai usem aquesta opci� de cadena_objectes
			plantilla.push("/", cadena_objectes[0], "?");
		else 
			plantilla.push("?");		
		var cp=plantilla.join("");			
		cp=cp.replace("{collectionId}", capa.nom);	
		cdns.push(cp);		
		cdns.push("crs=", capa.CRSgeometry, "&limit=1000&f=");  //�$� hauria json i no application/json
	}
	else
	{
		cdns.push("VERSION=",DonaVersioComAText(capa.versio),"&SERVICE=WFS&REQUEST=GetFeature&ATRIBUTFORMAT=complex&SRSNAME=" , 
	          capa.CRSgeometry ,"&TYPENAME=" ,capa.nom, "&OUTPUTFORMAT=");
	}
	if (capa.FormatImatge)
		cdns.push(capa.FormatImatge);
	else
		cdns.push("text/xml;subtype=gml/3.1.1/profiles/miramon/1.0.0/attributes");
		
	if(env)  //Est� en el mateix sistema de refer�ncia que la capa
	{
		cdns.push("&BBOX=" , env.MinX , "," , env.MinY , "," , env.MaxX , "," , env.MaxY);
		if(completa==false)
		{
			if(tipus=="TipusOAPI_Features")	 //�$� Potser ha de ser m�s sofisticat i diferent en funci� del format (json, gml,...)
				cdns.push("&PROPERTYNAME=" , capa.nom , "/geometry");
			else
				cdns.push("&PROPERTYNAME=" , capa.nom , "/gml:position");
			camps_implicats=DonaLlistaPropietatsSimbolitzacio(i_capa);
			for(i=0; i<camps_implicats.length; i++)
				if(camps_implicats[i] && camps_implicats[i]!="") 
					cdns.push(",",capa.nom , "/", camps_implicats[i]);
		}
	}
	else if(cadena_objectes && tipus=="TipusWFS")
	{
		// NJ_28-09-2020: Sembla ser que per aqu� no hi vinc mai , per� de moment no ho elimino perqu� potser �s necessita per quan vull fer transaccions
		// Si aix� al final s''usa caldr� adaptar-ho per a TipusOAPI_Features
		cdns.push("&FEATUREID=",cadena_objectes.join(","));
		if(completa==false)
		{
			cdns.push("&PROPERTYNAME=");
			c_afegir="";
			for(i=0; i<camps_implicats.length; i++)
				if(camps_implicats[i] && camps_implicats[i]!="") 
					cdns.c_afegir+=","+capa.nom + "/",+camps_implicats[i];
			for(var i_obj=0; i_obj<cadena_objectes.length; i_obj++)
				cdns.push("(", capa.nom , "/gml:position", c_afegir, ")");
		}
	}
	else if(completa==false)
	{
		if(tipus=="TipusOAPI_Features")	 //�$� Potser ha de ser m�s sofisticat i diferent en funci� del format (json, gml,...)
			cdns.push("&PROPERTYNAME=" , capa.nom , "/geometry");
		else
			cdns.push("&PROPERTYNAME=" , capa.nom , "/gml:position");
		camps_implicats=DonaLlistaPropietatsSimbolitzacio(i_capa);
		for(i=0; i<camps_implicats.length; i++)
			if(camps_implicats[i] && camps_implicats[i]!="") 
				cdns.push(",",capa.nom , "/", camps_implicats[i]);		
	}
	return AfegeixNomServidorARequest(DonaServidorCapa(capa), cdns.join(""), true, DonaCorsServidorCapa(capa));
}

function DonaRequestSOSGetFeatureOfInterest(i_capa, env)
{
var cdns=[];
var capa=ParamCtrl.capa[i_capa];

	cdns.push("VERSION=",DonaVersioComAText(capa.versio),"&SERVICE=SOS&REQUEST=GetFeatureOfInterest&observedProperty=", (capa.namespace ? capa.namespace + "/" + capa.nom + "/observedProperty" : capa.nom));
	if (env!=null)
	{
		var env2=null;
		if (capa.CRSgeometry.toUpperCase()!=ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS.toUpperCase())
			env2=DonaEnvolupantCRS(env, capa.CRSgeometry)
		else
			env2=env;
		cdns.push("&SRSNAME=",capa.CRSgeometry,"&BBOX=");
		if (CalGirarCoordenades(capa.CRSgeometry, null))
			cdns.push(env2.MinY,",",env2.MinX,",",env2.MaxY,",",env2.MaxX);
		else
			cdns.push(env2.MinX,",",env2.MinY,",",env2.MaxX,",",env2.MaxY);
	}	
	return AfegeixNomServidorARequest(DonaServidorCapa(capa), cdns.join(""), true, DonaCorsServidorCapa(capa));
}

function DonaRequestSTAFeaturesOfInterest(i_capa, env)
{
	return DonaRequestSTAObservationsFeatureOfInterest(i_capa, null, env);
}

function DonaRequestSTAObservationsFeatureOfInterest(i_capa, i_obj, env)
{
var cdns=[], cdns_datastream=[];
var capa=ParamCtrl.capa[i_capa];

	cdns_datastream.push(",name;$expand=Thing($select=name)");
	if (capa.tipus=="TipusSTAplus")
		cdns_datastream.push(",Party($select=name),Project($select=name),License($select=description)");
	cdns.push("/v",DonaVersioComAText(capa.versio),"/FeaturesOfInterest");
	if (i_obj==null)
	        cdns.push("?$top=10000000&");
	else
		cdns.push("('", capa.objectes.features[i_obj].id, "')?");
	cdns.push("$select=feature,id&$expand=Observations($select=result,phenomenonTime;$expand=Datastream($select=unitOfMeasurement", cdns_datastream.join(""), "),MultiDatastream($select=unitOfMeasurements", cdns_datastream.join(""), "))");
	if (env!=null)
	{
		var env2=null;
		if (capa.CRSgeometry.toUpperCase()!=ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS.toUpperCase())
			env2=DonaEnvolupantCRS(env, capa.CRSgeometry)
		else
			env2=env;
		cdns.push("&$filter=st_within(feature,geography'POLYGON((", env2.MinX, " ", env2.MinY, ",", env2.MaxX, " ", env2.MinY, ",", env2.MaxX, " ", env2.MaxY, ",", env2.MinX, " ", env2.MaxY, ",", env2.MinX, " ", env2.MinY, "))')");
	}	
	return AfegeixNomServidorARequest(DonaServidorCapa(capa), cdns.join(""), true, DonaCorsServidorCapa(capa));
}

//i_obj pot ser null per demanar-los tots
//env est� en el CRS actual
function DonaRequestGetObservation(i_capa, i_obj, env)
{
var cdns=[];
var capa=ParamCtrl.capa[i_capa];

	cdns.push("VERSION=",DonaVersioComAText(capa.versio),"&SERVICE=SOS&REQUEST=GetObservation&featureOfInterest=", 
											capa.namespace, "/", capa.nom, "/featureOfInterest/", (i_obj==null ? "" : capa.objectes.features[i_obj].id));
	if (env!=null)
	{
		var env2=null;
		if (capa.CRSgeometry.toUpperCase()!=ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS.toUpperCase())
			env2=DonaEnvolupantCRS(env, capa.CRSgeometry)
		else
			env2=env;
		cdns.push("&SRSNAME=",capa.CRSgeometry,"&BBOX=");
		if (CalGirarCoordenades(capa.CRSgeometry, null))
			cdns.push(env2.MinY,",",env2.MinX,",",env2.MaxY,",",env2.MaxX);
		else
			cdns.push(env2.MinX,",",env2.MinY,",",env2.MaxX,",",env2.MaxY);
	}
	return AfegeixNomServidorARequest(DonaServidorCapa(capa), cdns.join(""), true, DonaCorsServidorCapa(capa));
}

function FesPeticioAjaxObjectesDigitalitzatsPerEnvolupant(i_capa_digi, env, seleccionar)
{
var i_event, capa=ParamCtrl.capa[i_capa_digi];
	//ConsultaCapaDigi[i_consulta]=new CreaConsultaCapaDigi(i_capa_digi, -1, seleccionar);
	//env est� en el CRS de la capa

	var url=DonaRequestOWSObjectesDigi(i_capa_digi, env, null, false);
	var tipus=DonaTipusServidorCapa(capa);	

	if (tipus=="TipusWFS")
		i_event=CreaIOmpleEventConsola("GetFeature", i_capa_digi, url, TipusEventGetFeature);
	else if (tipus=="TipusOAPI_Features")
		i_event=CreaIOmpleEventConsola("OAPI_Features", i_capa_digi, url, TipusEventGetFeature);
	else if (tipus=="TipusSOS")
		i_event=CreaIOmpleEventConsola("GetFeatureOfInterest", i_capa_digi, url, TipusEventGetFeatureOfInterest);
	else if (tipus=="TipusSTA" || tipus=="TipusSTAplus")
		i_event=CreaIOmpleEventConsola("STA FeaturesOfInterest", i_capa_digi, url, TipusEventGetFeatureOfInterest);

	if (capa.FormatImatge=="application/json" || tipus=="TipusSTA" || tipus=="TipusSTAplus")
		loadJSON(url, OmpleCapaDigiAmbObjectesDigitalitzats, ErrorCapaDigiAmbObjectesDigitalitzats, {"i_capa_digi": i_capa_digi, "i_tile": -1, "seleccionar": seleccionar, "i_event": i_event});
	else
		loadFile(url, (capa.FormatImatge) ? capa.FormatImatge : "text/xml", OmpleCapaDigiAmbObjectesDigitalitzats, ErrorCapaDigiAmbObjectesDigitalitzats, {"i_capa_digi": i_capa_digi, "i_tile": -1, "seleccionar": seleccionar, "i_event": i_event});
}//Fi de FesPeticioAjaxObjectesDigitalitzatsPerEnvolupant()

function FesPeticioAjaxObjectesDigitalitzatsPerIdentificador(i_capa_digi, cadena_objectes, seleccionar)
{
var i_event, capa=ParamCtrl.capa[i_capa_digi];

	//ConsultaCapaDigi[i_consulta]=new CreaConsultaCapaDigi(i_capa_digi, -1, seleccionar);

	var url=DonaRequestOWSObjectesDigi(i_capa_digi, null, cadena_objectes, false);
	if (capa.tipus=="TipusWFS")
		i_event=CreaIOmpleEventConsola("GetFeature", i_capa_digi, url, TipusEventGetFeature);
	else if (capa.tipus=="TipusOAPI_Features")
		i_event=CreaIOmpleEventConsola("OAPI_Features", i_capa_digi, url, TipusEventGetFeature);
	else if (capa.tipus=="TipusSOS")
		i_event=CreaIOmpleEventConsola("GetFeatureOfInterest", i_capa_digi, url, TipusEventGetFeatureOfInterest);
	else if (capa.tipus=="TipusSTA" || capa.tipus=="TipusSTAplus")
		i_event=CreaIOmpleEventConsola("STA FeatureOfInterest", i_capa_digi, url, TipusEventGetFeatureOfInterest);

	loadFile(url, (capa.FormatImatge) ? capa.FormatImatge : "text/xml", OmpleCapaDigiAmbObjectesDigitalitzats, ErrorCapaDigiAmbObjectesDigitalitzats, {"i_capa_digi": i_capa_digi, "i_tile": -1, "seleccionar": seleccionar, "i_event": i_event});
}//Fi de FesPeticioAjaxObjectesDigitalitzatsPerIdentificador()

//var ajax_capa_digi=[];
function FesPeticioAjaxObjectesDigitalitzats(i_capa_digi, i_tile, env_sol, seleccionar, funcio, param)
{
	//ConsultaCapaDigi[i_consulta]=new CreaConsultaCapaDigi(i_capa_digi, i_tile, seleccionar);
var i_event, capa=ParamCtrl.capa[i_capa_digi];

	capa.TileMatrixGeometry.tiles_solicitats[i_tile]="TileSolicitat";
	var tipus=DonaTipusServidorCapa(capa);	

	var url=DonaRequestOWSObjectesDigi(i_capa_digi, env_sol, null, false);
	if (tipus=="TipusWFS")
		i_event=CreaIOmpleEventConsola("GetFeature", i_capa_digi, url, TipusEventGetFeature);
	else if (tipus=="TipusOAPI_Features")
		i_event=CreaIOmpleEventConsola("OAPI_Features", i_capa_digi, url, TipusEventGetFeature);
	else if (tipus=="TipusSOS")
		i_event=CreaIOmpleEventConsola("GetFeatureOfInterest", i_capa_digi, url, TipusEventGetFeatureOfInterest);
	else if (tipus=="TipusSTA" || tipus=="TipusSTAplus")
		i_event=CreaIOmpleEventConsola("STA FeatureOfInterest", i_capa_digi, url, TipusEventGetFeatureOfInterest);

	//env_sol est� ja en el CRS de la capa
	//ajax_capa_digi[i_consulta].doGet(url, OmpleCapaDigiAmbObjectesDigitalitzats, "text/xml", {"i_capa_digi": i_capa_digi, "i_tile": i_tile, "seleccionar": seleccionar, "i_event": i_event});
	if (capa.FormatImatge=="application/json" || tipus=="TipusSTA" || tipus=="TipusSTAplus")
		loadJSON(url, OmpleCapaDigiAmbObjectesDigitalitzats, ErrorCapaDigiAmbObjectesDigitalitzats,
			 {i_capa_digi: i_capa_digi, i_tile: i_tile, seleccionar: seleccionar, i_event: i_event, funcio: funcio, param:param});
	else
		loadFile(url, (capa.FormatImatge) ? capa.FormatImatge : "text/xml", OmpleCapaDigiAmbObjectesDigitalitzats, ErrorCapaDigiAmbObjectesDigitalitzats,
			 {i_capa_digi: i_capa_digi, i_tile: i_tile, seleccionar: seleccionar, i_event: i_event, funcio: funcio, param:param});

}//Fi de FesPeticioAjaxObjectesDigitalitzats()



function DemanaTilesDeCapaDigitalitzadaSiCal(i_capa, env, funcio, param)
{
var env_total, env_temp, incr_x=0, incr_y=0, i_tile=0, capa=ParamCtrl.capa[i_capa];

var tiles=capa.TileMatrixGeometry;
var ha_calgut=false, vaig_a_carregar=false;

	// Si la capa t� un EnvTotal faig la tessel�laci� respecte aquest env i sino respecte la/les imatges de situaci� que tenen el mateix sistema de refer�ncia (CRSgeometry)
	if(!tiles.env)
	{
		tiles.env={"EnvCRS": {"MinX": +1e300, "MaxX": -1e300, "MinY": +1e300, "MaxY": -1e300}, "CRS": capa.CRSgeometry};
		if(capa.EnvTotal)
		{
			tiles.env.EnvCRS.MinX=capa.EnvTotal.EnvCRS.MinX;
			tiles.env.EnvCRS.MinY=capa.EnvTotal.EnvCRS.MinY;
			tiles.env.EnvCRS.MaxX=capa.EnvTotal.EnvCRS.MaxX;
			tiles.env.EnvCRS.MaxY=capa.EnvTotal.EnvCRS.MaxY;
			
			if(capa.EnvTotal.CRS && capa.EnvTotal.CRS.toUpperCase()!=tiles.env.CRS.toUpperCase())
				TransformaEnvolupant(tiles.env.EnvCRS, crs_ori, tiles.env.CRS);			
		}
		else
		{
			for (var i=0; i<ParamCtrl.ImatgeSituacio.length; i++)
			{
				if (ParamCtrl.ImatgeSituacio[i].EnvTotal.CRS.toUpperCase()==tiles.env.CRS.toUpperCase())
				{
					if (tiles.env.EnvCRS.MinX>ParamCtrl.ImatgeSituacio[i].EnvTotal.EnvCRS.MinX)
						tiles.env.EnvCRS.MinX=ParamCtrl.ImatgeSituacio[i].EnvTotal.EnvCRS.MinX;
					if (tiles.env.EnvCRS.MaxX<ParamCtrl.ImatgeSituacio[i].EnvTotal.EnvCRS.MaxX)
						tiles.env.EnvCRS.MaxX=ParamCtrl.ImatgeSituacio[i].EnvTotal.EnvCRS.MaxX;
					if (tiles.env.EnvCRS.MinY>ParamCtrl.ImatgeSituacio[i].EnvTotal.EnvCRS.MinY)
						tiles.env.EnvCRS.MinY=ParamCtrl.ImatgeSituacio[i].EnvTotal.EnvCRS.MinY;
					if (tiles.env.EnvCRS.MaxY<ParamCtrl.ImatgeSituacio[i].EnvTotal.EnvCRS.MaxY)
						tiles.env.EnvCRS.MaxY=ParamCtrl.ImatgeSituacio[i].EnvTotal.EnvCRS.MaxY;
				}
			}
		}
	}
	//env en el sistema de refer�ncia actual --> La divisi� en tiles �s en funci� del CRS indicat a ParamCtrl.capa[i_capa].i_situacio
	if(ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS==tiles.env.CRS)
		env_total={"MinX": env.MinX, "MaxX": env.MaxX, "MinY": env.MinY, "MaxY": env.MaxY};
	else
		env_total=TransformaEnvolupant(env, ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS, tiles.env.CRS);

	if(env_total.MinX<tiles.env.EnvCRS.MinX)
		env_total.MinX=tiles.env.EnvCRS.MinX;
	if(env_total.MaxX>tiles.env.EnvCRS.MaxX)
		env_total.MaxX=tiles.env.EnvCRS.MaxX;
	if(env_total.MinY<tiles.env.EnvCRS.MinY)
		env_total.MinY=tiles.env.EnvCRS.MinY;
	if(env_total.MaxY>tiles.env.EnvCRS.MaxY)
		env_total.MaxY=tiles.env.EnvCRS.MaxY;
	
	//Ara haig de fer els talls en funci� de l'ambit del CRS indicat en capa i en la mida indicada i mirar si tinc els talls o no i sol�licitar-los
	incr_x=(tiles.env.EnvCRS.MaxX-tiles.env.EnvCRS.MinX)/tiles.MatrixWidth;
	incr_y=(tiles.env.EnvCRS.MaxY-tiles.env.EnvCRS.MinY)/tiles.MatrixHeight;
	
	env_temp={"MinX": env_total.MinX, "MaxX": env_total.MaxX, "MinY": env_total.MinY, "MaxY": env_total.MaxY};
	if(!param.carregant_geo)
	{
		param.carregant_geo=true;
		vaig_a_carregar=true;
	}
	for(var i_col=0; i_col<tiles.MatrixWidth; i_col++)
	{
		if(((tiles.env.EnvCRS.MinX+(i_col*incr_x))<=env_temp.MinX )&& 
		   ((tiles.env.EnvCRS.MinX+((i_col+1)*incr_x))>=env_temp.MinX))
		{
			for(var j_fil=0; j_fil<tiles.MatrixHeight; j_fil++)
			{
				i_tile=((j_fil)*tiles.MatrixWidth)+i_col;
				if((tiles.env.EnvCRS.MinY+(j_fil*incr_y))<=env_temp.MinY && 
				   (tiles.env.EnvCRS.MinY+((j_fil+1)*incr_y))>=env_temp.MinY)
				{
					if(tiles.tiles_solicitats[i_tile]=="TileNoSolicitat")
					{
						var env_sol={"MinX": tiles.env.EnvCRS.MinX+(i_col*incr_x), 
							     	"MaxX": tiles.env.EnvCRS.MinX+((i_col+1)*incr_x), 
							     	"MinY": tiles.env.EnvCRS.MinY+(j_fil*incr_y), 
							     	"MaxY": tiles.env.EnvCRS.MinY+((j_fil+1)*incr_y)};								   
									   
						env_sol=TransformaEnvolupant(env_sol, tiles.env.CRS, capa.CRSgeometry);
						if(vaig_a_carregar)
						{
							ha_calgut=true;
							if (tiles.MatrixWidth==1 && tiles.MatrixHeight==1 && (capa.tipus=="TipusSOS" || capa.tipus=="TipusSTA" || capa.tipus=="TipusSTAplus"))
							{
								//Les peticions GetFeatureOfInterest no suporten BBOX de manera standard, o sigui que en aquest cas, donat que es demana tot d'un sol bloc, decideixo no posar bbox per si no fos un servidor nostre.
								FesPeticioAjaxObjectesDigitalitzats(i_capa, i_tile, null, false, funcio, param);
							}
							else
								FesPeticioAjaxObjectesDigitalitzats(i_capa, i_tile, env_sol, false, funcio, param);
						}
						else
							return true;
					}
				}			
				env_temp.MinY=(tiles.env.EnvCRS.MinY+((j_fil+1)*incr_y));
				if(env_temp.MaxY<=env_temp.MinY)
					break;					
			}			
		}
		env_temp.MinX=(tiles.env.EnvCRS.MinX+((i_col+1)*incr_x));
		if(env_temp.MaxX<=env_temp.MinX)
			break;					
		env_temp.MinY=env_total.MinY;
	}
	return ha_calgut;
}

var EnvSelec=null;

function SeleccionaObjsCapaDigiPerEnvolupant(id_capa, minx, maxx, miny, maxy, afegir)
{
var env={"MinX": minx, "MaxX": maxx, "MinY": miny, "MaxY": maxy};

	if(afegir==false)
		EsborraSeleccio();
		
	//Busco l'index de capa
	var i_capa=-1;
	if(ParamCtrl.capa)
	{
		for(var i=0; i<ParamCtrl.capa.length; i++)
			if(ParamCtrl.capa[i].model==model_vector && ParamCtrl.capa[i].nom==id_capa)
				i_capa=i;
	}
	if(i_capa==-1)
	{
		alert(DonaCadenaLang({"cat":"No es poden seleccionar els objectes sol�licitats perqu� la capa no existeix.", 
							  "spa":"No se pueden seleccionar los objetos solicitados porqu� la capa no existe.",
							  "eng":"Cannot select request objecte because the layer doesn't exist.",
							  "fre":"Les objets demand�s ne peuvent pas �tre s�lectionn�es parce que la couche n'existe pas"}));
		return;
	}
	if(ParamCtrl.capa[i_capa].CRSgeometry.toUpperCase()!=ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS.toUpperCase())
		env=TransformaEnvolupant(env, ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS, ParamCtrl.capa[i_capa].CRS);
	FesPeticioAjaxObjectesDigitalitzatsPerEnvolupant(i_capa, env, true);
}//Fi de SeleccionaObjsCapaDigiPerEnvolupant()


// Aquesta funci� sembla ser que no s'usa enlloc (NJ 28-09-2020)
function SeleccionaObjsCapaDigiPerIdentificador(id_capa, id_obj, afegir)
{
var i_capa;
var punt, i;

	if(afegir==false)
		EsborraSeleccio();
		
	//Busco l'index de capa
	var i_capa=-1;
	if(ParamCtrl.capa)
	{
		for(var i=0; i<ParamCtrl.capa.length; i++)
			if(ParamCtrl.capa[i].nom==id_capa)
				i_capa=i;
	}
	if(i_capa==-1)
	{
		alert(DonaCadenaLang({"cat":"No es poden seleccionar els objectes sol�licitats perqu� la capa no existeix.", 
							  "spa":"No se pueden seleccionar los objetos solicitados porqu� la capa no existe.",
							  "eng":"Cannot select request objecte because the layer doesn't exist.",
							  "fre":"Les objets demand�s ne peuvent pas �tre s�lectionn�es parce que la couche n'existe pas"}));
		return;
	}
	//Marco els objectes i els demano si cal
	var cadena_objectes=[], capa=ParamCtrl.capa[i_capa];
	if (capa.objectes && capa.objectes.features && capa.objectes.features.length>0)
	{
		for(var j=0; j<id_obj.length; j++)
		{
			for(i=0; i<capa.objectes.features.length; i++)
			{
				if(id_obj[j]==capa.objectes.features[i].id)
				{
					capa.objectes.features[i].seleccionat=true;
					
					//Actualitzar EnvSelec, que sempre est� en el sistema de coordenades actual
					DonaCoordenadaPuntCRSActual(punt, capa.objectes.features[i], capa.CRSgeometry);
					if(EnvSelec==null)
						EnvSelec={"MinX": punt.x, "MaxX": punt.x, "MinY": punt.y, "MaxY": punt.y};
					else
					{
						if(punt.x<EnvSelec.MinX)
							EnvSelec.MinX=punt.x;
						if(punt.x>EnvSelec.MaxX)
							EnvSelec.MaxX=punt.x;
						if(punt.y<EnvSelec.MinY)
							EnvSelec.MinY=punt.y;
						if(punt.y>EnvSelec.MaxY)
							EnvSelec.MaxY=punt.y;
					}
					break;
				}
			}
			if(i==capa.objectes.features.length) //No trobat
				cadena_objectes[cadena_objectes.length]=id_obj[j];
		}
	}
	else
	{
		//Els demano tots
		for(var j=0; j<id_obj.length; j++)
			cadena_objectes[cadena_objectes.length]=id_obj[j];
	}
	//Faig la petici� dels objectes no trobats
	if(cadena_objectes.length>0)
		FesPeticioAjaxObjectesDigitalitzatsPerIdentificador(i_capa, cadena_objectes, true);
}//Fi de SeleccionaObjsCapaDigiPerIdentificador()

function DonaMidaIconaForma(icona)
{
	if (icona.a)
	{
		if (icona.type=="square")
			return Math.sqrt(icona.a*icona.fescala);
		return Math.sqrt(icona.a*icona.fescala/Math.PI);
	}	
	return icona.r*icona.fescala;
}

function DonaEnvIcona(punt, icona)
{
var env={}, mida;

	if (Array.isArray(icona))
	{
		env.MinI=MinJ=+1e300;
		env.MaxI=MaxJ=-1e300;
		for (var i=0; i<icona.length; i++)
		{
			mida=DonaMidaIconaForma(icona);
			if (icona[i].type=="circle")
			{
				if (env.MinI>-mida)
					env.MinI=-mida;
				if (env.MinJ>-mida)
					env.MinJ=-mida;
				if (env.MaxI<mida)
					env.MaxI=mida;
				if (env.MaxJ<mida)
					env.MaxJ=mida;
			}
			else if (icona.type=="square")
			{
				if (env.MinI>-mida/2)
					env.MinI=-mida/2;
				if (env.MinJ>-mida/2)
					env.MinJ=-mida/2;
				if (env.MaxI<mida/2)
					env.MaxI=mida/2;
				if (env.MaxJ<mida/2)
					env.MaxJ=mida/2;
			}
			else if (icona[i].type=="arc")
			{
				alert("DonaEnvIcona() does not implement 'arc' support yet");
			}
			else if (icona[i].type=="polyline")
			{
				for (var c=0; c<icona[i].coordinates.length; c++)
				{					
					if (env.MinI>icona[i].coordinates[c][0])
						env.MinI=icona[i].coordinates[c][0];
					if (env.MinJ>icona[i].coordinates[c][1])
						env.MinJ=icona[i].coordinates[c][1];
					if (env.MaxI<icona[i].coordinates[c][0])
						env.MaxI=icona[i].coordinates[c][0];
					if (env.MaxJ<icona[i].coordinates[c][1])
						env.MaxJ=icona[i].coordinates[c][1];
				}
			}
		}
	}
	else if (icona.type=="circle")
	{
		mida=DonaMidaIconaForma(icona);
		env.MinI=env.MinJ=-mida;
		env.MaxI=env.MaxJ=mida;
	}
	else if (icona.type=="square")
	{
		mida=DonaMidaIconaForma(icona);
		env.MinI=env.MinJ=-mida/2;
		env.MaxI=env.MaxJ=mida/2;
	}
	else if (icona.icona) //Una icona com a url a una png o similar
	{
		env.MinI=-icona.i*icona.fescala;
		env.MaxI=(icona.ncol-icona.i)*icona.fescala;
		env.MinJ=-icona.j*icona.fescala;
		env.MaxJ=(icona.nfil-icona.j)*icona.fescala;
	}
	else
		env.MaxJ=env.MaxI=env.MinJ=env.MinI=0;

	if (icona.unitats=="m")
	{
		if (EsProjLongLat(ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS))
		{
			env.MinI/=FactorGrausAMetres;
			env.MaxI/=FactorGrausAMetres;
			env.MinJ/=FactorGrausAMetres;
			env.MaxJ/=FactorGrausAMetres;
		}					
		return {"MinX": punt.x+env.MinI, 
			"MaxX": punt.x+env.MaxI, 
			"MinY": punt.y-env.MaxJ, 
			"MaxY": punt.y-env.MinJ};
	}
	return {"MinX": punt.x+env.MinI*ParamInternCtrl.vista.CostatZoomActual, 
		"MaxX": punt.x+env.MaxI*ParamInternCtrl.vista.CostatZoomActual, 
		"MinY": punt.y-env.MaxJ*ParamInternCtrl.vista.CostatZoomActual, 
		"MaxY": punt.y-env.MinJ*ParamInternCtrl.vista.CostatZoomActual};
}

function CanviaCRSITransformaCoordenadesCapaDigi(capa, crs_dest)
{
	if (capa.model==model_vector)
	{
		if(capa.CRSgeometry &&
		   capa.CRSgeometry.toUpperCase()!=crs_dest.toUpperCase() && capa.objectes && capa.objectes.features)
		{
			for(var j=0; j<capa.objectes.features.length; j++)
			{
				var feature=capa.objectes.features[j], coordinates2, coordinates3;
				feature.geometryCRSactual=JSON.parse(JSON.stringify(feature.geometry));
				if (feature.geometryCRSactual.type=="MultiPolygon")
				{
					for(var c3=0; c3<feature.geometryCRSactual.coordinates.length; c3++)
					{	
						coordinates3=feature.geometryCRSactual.coordinates[c3];
						for(var c2=0; c2<coordinates3.length; c2++)
						{	
							coordinates2=coordinates3[c2];
							for(var c1=0; c1<coordinates2.length; c1++)
								TransformaCoordenadesArray(coordinates2[c1], capa.CRSgeometry, crs_dest);
						}
					}
				}
				else if (feature.geometryCRSactual.type=="MultiLineString" || feature.geometryCRSactual.type=="Polygon")
				{
					for(var c2=0; c2<feature.geometryCRSactual.coordinates.length; c2++)
					{	
						coordinates2=feature.geometryCRSactual.coordinates[c2];
						for(var c1=0; c1<coordinates2.length; c1++)
							TransformaCoordenadesArray(coordinates2[c1], capa.CRSgeometry, crs_dest);
					}
				}
				else if (feature.geometryCRSactual.type=="LineString" || feature.geometryCRSactual.type=="Multipoint")
				{
					for(var c1=0; c1<feature.geometryCRSactual.coordinates.length; c1++)
					{	
						TransformaCoordenadesArray(feature.geometryCRSactual.coordinates[c1], capa.CRSgeometry, crs_dest);
					}
				}
				else if (feature.geometryCRSactual.type=="Point")
					TransformaCoordenadesArray(feature.geometryCRSactual.coordinates, capa.CRSgeometry, crs_dest);
				else
					feature.geometryCRSactual.coordinates=null;
			}
		}
	}
}
