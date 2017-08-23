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

    Copyright 2001, 2016 Xavier Pons

    Aquest codi JavaScript ha estat realitzat per Joan Mas� Pau 
    (joan maso at uab cat) i N�ria Juli� (n julia at creaf uab cat) i
    Daniel D�az (d diaz at creaf uab cat) dins del grup de MiraMon. 
    MiraMon �s un projecte del Centre de recerca i aplicacions forestals (CREAF) 
    que elabora programari de Sistema d'Informaci� Geogr�fica i de Teledetecci� 
    per a la visualitzaci�, consulta, edici� i an�lisi de mapes r�sters i 
    vectorials. Elabora programari d'escriptori i tamb� servidors i clients 
    per Internet. No tots aquests productes s�n gratu�ts o de codi obert. 
    En particular, el Navegador de Mapes del MiraMon (client per Internet) 
    es distribueix sota els termes de la llic�ncia "GNU General Public 
    License". Es pot actualitzar des de www.creaf.uab.cat/miramon/mmn
*/

/* Daniel D�az Benito (d.diaz@creaf.uab.cat) 18-XII-2012
 * Script to allow OWSC (OGC Web Services Context) files to be opened and generated.
 * This Open Geospatial Consortium standard allows to save the maps application
 * status and retrieve it with the same maps and processes, even in different
 * computers and compatible software.
 */

//Some configuration values
ParamOWSC= {
	defaultCRS: "EPSG:4326"
};

/*Given a resource entry, is that one openable by the Map browser?*/
function isOpenableLayer(myResource)
{
	var myWhere;

	//Test if the offering type is within the supported ones
	//To improve: Test all the possible offerings in the entry layer
	if(myResource.offerings && myResource.offerings.length)
	{
		var i= myResource.offerings.length,
			isSupported= false;
		
		while(i--)
		{
			if(!myResource.offerings[i].nonSupported)
			{
				isSupported= true;
				break; //We have at least 1 supported offering
			}
		}
		if(!isSupported)
			return myResource.offerings[0].nonSupported;
	}
	else
		return DonaCadenaLang({"cat":"Aquesta entrada no t� cap contingut geoespacial (cap etiqueta 'offering' definida).",
								"spa":"Esta entrada carece de contenido geoespacial (ninguna etiqueta 'offering' definida).",
								"eng":"This entry is empty of geospatial content (no 'offering' tag defined).",
								"fre":"Cette entr�e manque du contenu g�ospatial (aucune �tiquette 'offering' d�finie)."});

	//Is the resource CRS compatible with the map CRS?
	if(myResource.where)
		myWhere= myResource.where;
	else if(OWSCDocument && OWSCDocument.where)
		myWhere= OWSCDocument.where;

	if(myWhere && !MMisMapCompatibleCRS(myWhere.CRS.name))
		return DonaCadenaLang({"cat":"Sistema de refer�ncia de coordenades no compatible.",
								"spa":"Sistema de referencia de coordenadas no compatible.",
								"eng":"Non-compatible Coordinate Reference System.",
								"fre":"Syst�me de r�f�rence de coordonn�es non compatible."});
	return 0;
}

function parseOWSCDate(tag)
{
	return new Date(Date.parse(tag.textContent)).toLocaleString();
}
//Process the value of a tag and returns a string to show to the user (requires Gml() libraries)
function parseWhere(geoTag,myHolder,myOWSC)
{
	var collection= loadGeoRSSTag(geoTag),
		myGml,
		i=0;

	if(!collection || !collection.length)
		return "";

	//Only get the first Envelope element:
	for(i=0;i<collection.length && collection[i].type!==3 && collection[i].type!==2;i++);

	//i corresponds to the first envelope element
	myGml= collection[i];
	if(myGml.type===2 && myGml.vertexs.length>=2)
	{
		//Convert the polygon into an envelope
		myGml= myGml.toGmlBox();
	}
	else if(myGml.type!==3)
		return DonaCadenaLang({"cat":"El format de 'where' no inclou cap 'Envelope' o 'Polygon' de 2 o m�s punts.",
								"spa":"El formato de 'where' no incluye ning�n 'Envelope' o 'Polygon' de 2 o m�s puntos.",
								"eng":"The format of 'where' do not have any 'Envelope' or 'Polygon' of 2 or more points.",
								"fre":"Le format de 'where' n'inclut pas de 'Envelope' ou ' Polygon ' de 2 ou plus de points."});

	//Permet guardar el resultat de myGml a un objecte
	if(myHolder)
	{
		if(myGml)
			myHolder.where= myGml;
		//Si no hem aconseguit un Gml v�lid, per� en tenim un de global definit,
		//li assignem a aquesta capa.
		else if(myOWSC && myOWSC.where)
			myHolder.where= myOWSC.where;
	}

	return "<span title=\""+myGml.CRS.name+"\">"+myGml.CRS.getDescription()+" ("+myGml.CRS.dimensions+"D)<ul class=\"field\"><li>X max: "
		+myGml.upperCorner.x+" "+myGml.CRS.units
		+"</li><li>X min: "+myGml.lowerCorner.x+" "+myGml.CRS.units
		+"</li><li>Y max: "+myGml.upperCorner.y+" "+myGml.CRS.units
		+"</li><li>Y min: "+myGml.lowerCorner.y+" "+myGml.CRS.units
		+"</li></ul></span>";
}
/*
 * Obtain the bounding box for certain layer. It firstly tries to get the
 * general where for the whole OWSC document, otherwise the entry where,
 * otherwise try to retrieve it from the entry offerings.
 * @param {OWSCLayer} myLayer
 */
function getWhere(myLayer)
{
	if(OWSCDocument.where)
		return OWSCDocument.where;
	else if(myLayer.where)
		return myLayer.where;
	else
	{
		//Look though the offerings
		return undefined; //Not yet implemented...
	}
	return undefined;
}
function Offering(myOWSCLayer)
{
	this.layer= myOWSCLayer;
	this.layerId= null; //The code name of the layer used in the LAYERS parameter
	this.code= null; //The offering original code, which is a URL to the offering type spec, and it's used to get the offering type
	this.typeName= null; //Service type of offering: WMS, WMTS, WFS, GML, etc...
	this.type= null; //The service type using a flag as defined for this Map Browser
	this.operations= Array(); //The 0 to more operations that each offering can have defined
	this.nonSupported= null; //If different than null, means the offering cannot be opened. It shall be a string with the reason.
	this.server= null; //Server URL of the service
	this.version= null; //Version of the service offered
	this.mime= null; //Mime type of the request answer format
}

/*
 * As parameters can be in different formats, I use this workarround to
 * get the proper parameter value. It would be better to make parseQuery
 * result to be transformed in a way all the param members are in UpperCase.
 * @param {Parameters Object} myObject
 * @param {string} myProp
 * @returns {string} Value of the parameter
 */
function getPropValue(myObject,myProp)
{
	if(myObject[myProp])
		return myObject[myProp];
	else if(myObject[myProp.toUpperCase()])
		return myObject[myProp.toUpperCase()];
	else if(myObject[myProp.toLowerCase()])
		return myObject[myProp.toLowerCase()];
	return {};
}
function parseWMSOffering(tag,myOffering)
{
	var elem,
		reason,
		isSupported= false, //In order to check if at least one operation is supported
		myURI,
		url,
		operationParams,
		operationTags,
		i;

	myOffering.type="TipusWMS";
	myOffering.operationsHTML= [], //Used to store the info of the operation in HTML to show to the user

	//Process the operations within the offering
	operationTags=DonamElementsNodeAPartirDelNomDelTag(tag, null, "owc", "operation");
	if(operationTags && operationTags.length>0)
	{
		for(i=0;i<operationTags.length;i++)
		{
			//Only process GetMap operations for now...
			elem= operationTags[i].getAttribute("code");
			url= operationTags[i].getAttribute("href");
			//Build some description to show the operation description to the user
			myOffering.operationsHTML[i]= DonaCadenaLang({"cat":"Petici�","spa":"Petici�n","eng":"Request","fre":"Demande"});
			if(elem)
			{
				if(url)
					myOffering.operationsHTML[i]+= "<a href=\""+url+"\">"+elem+"</a>";
				else
					myOffering.operationsHTML[i]+= elem+" (error: no 'href')";
			}
			else
				myOffering.operationsHTML[i]+= DonaCadenaLang({"cat":"desconeguda","spa":"desconocida","eng":"Unknown","fre":"inconnu"});
			myOffering.operationsHTML[i]+= DonaCadenaLang({"cat":" petici�","spa":" petici�n","eng":" request","fre":" demande"});

			//If this is something we cannot use to open the layer in the client,
			//this is as far as we can get.
			if(elem!=="GetMap")
			{
				reason= DonaCadenaLang({"cat":"'Operation' no acceptada '"+elem+"'",
									"spa":"'Operation' no soportada '"+elem+"'",
									"eng":"Non supported operation '"+elem+"'",
									"fre":"'Operation' non support�e'"+elem+"'"});
				continue;
			}

			//Check if the request method is supported
			elem= operationTags[i].getAttribute("method");
			if(elem!=="GET")
			{
				reason= DonaCadenaLang({"cat":"M�tode d'operaci� '"+elem+"' no acceptat (nom�s GET �s acceptat actualment)",
									"spa":"M�todo de operaci�n '"+elem+"' no aceptado (s�lo GET es soportado actualmente)",
									"eng":"Non supported operation method '"+elem+"' (only GET is currently supported)",
									"fre":"M�thode d'op�ration '"+elem+"' non accept�e (seulement 'GET' est actuellement support�e)"});
				continue;
			}
			
			//Get the minimum required data to make the layer work: server, version and type
			//We obtain the data from the requestURL
			//elem= operationTags[i].getAttribute("href"); Already got into 'url'
			if(!url)
			{
				reason= DonaCadenaLang({"cat":"L'atribut 'href' no s'ha trobat en l'operaci�, la 'requestURL' no es pot obtenir.",
									"spa":"El atributo 'href' no se encontr� en la operaci�n, la 'requestURL' no se puede obtener",
									"eng":"Attribute 'href' was not found in the operation, the 'requestURL' cannot be obtained",
									"fre":"L'attribut 'href' n'a pas �t� trouv� dans l'op�ration, le 'requestURL' ne peut pas �tre obtenu"});
				continue;
			}
			//Create an URI object using URI.js This has been removed by JM as it seems not necessary to use this library.
			//myURI= new URI(elem);  Comento aquesta linia que igualment estava malament donat que elem no contenia cap URL (JM). Jo crec que calia passar "url" en lloc de "elem". Deixo tamb� la resta del codi antic comentat.
			//Set the server URL
			lloc_interrogant=url.indexOf("?");
			myOffering.server= (lloc_interrogant==-1) ? url : url.substring(0, lloc_interrogant);
			//myOffering.server= myURI.protocol()+"://"+myURI.authority()+myURI.pathname();
			//Obtain an object with the parsed parameters of the query
			//operationParams= URI.parseQuery(myURI.query());
			//Set the version of the service
			//myOffering.version=getPropValue(operationParams,"Version");
			//and the layers towards which the request is done
			//myOffering.layerId= getPropValue(operationParams,"Layers");

			//Retrieve the mime type of the answer
			//elem= operationTags[i].getAttribute("type");
			//if(elem)
			//	myOffering.mime= elem;
			//else if(getPropValue(operationParams,"Format"))
			//	myOffering.mime= getPropValue(operationParams,"Format");
			if (lloc_interrogant!=-1)
			{
				elem= operationTags[i].getAttribute("type");
				if(elem)
					myOffering.mime= elem;

				var kvp=url.substring(url.substring(lloc_interrogant), url.length).split("&");
				var s;
				for (var i_kvp=0; i_kvp<kvp.length; i_kvp++)
				{
					s="VERSION=";
					if (kvp[i_kvp].substring(0, s.length).toUpperCase()==s)
						myOffering.version=unescape(kvp[i_kvp].substring(s.length, kvp[i_kvp].length));
					s="LAYERS=";
					if (kvp[i_kvp].substring(0, s.length).toUpperCase()==s)
						myOffering.layerId=unescape(kvp[i_kvp].substring(s.length, kvp[i_kvp].length));

					//Retrieve the mime type of the answer
					elem= operationTags[i].getAttribute("type");
					if(!elem)
					{
						s="FORMAT=";
						if (kvp[i_kvp].substring(0, s.length).toUpperCase()==s)
							myOffering.mime=unescape(kvp[i_kvp].substring(s.length, kvp[i_kvp].length));
					}
				}
			}
			else
			{
				myOffering.version="";
				myOffering.layerId="";
				elem= operationTags[i].getAttribute("type");
				if(elem)
					myOffering.mime= elem;
				else
					myOffering.mime= "";
			}

			//At least we have one supported operation
			isSupported= true;
		}
	}
	if(!isSupported)
		myOffering.nonSupported= reason;
}

function parseWMTSOffering(tag,myOffering)
{
	var elem,
		reason,
		isSupported= false, //In order to check if at least one operation is supported
		myTileMatrixSet,
		bBox= getWhere(myOffering.layer),
		operationTags,
		tilesWidth= [],
		tilesHeight= [],
		tilesTop= [],
		tilesLeft= [],
		tilesOpacity= [],
		i,
		x;

	myOffering.type="TipusWMTS_REST";

	//Process the operations within the offering
	operationTags=DonamElementsNodeAPartirDelNomDelTag(tag, null, "owc", "operation");
	if(operationTags && operationTags.length>0)
	{
		for(i=0;i<operationTags.length;i++)
		{
			//Only process GetMap operations for now...
			elem= operationTags[i].getAttribute("code");
			if(elem!=="GetTile")
			{
				reason= DonaCadenaLang({"cat":"'Operation' no acceptada '"+elem+"'",
									"spa":"'Operation' no soportada '"+elem+"'",
									"eng":"Non supported operation '"+elem+"'",
									"fre":"'Operation' non support�e'"+elem+"'"});
				continue;
			}

			//Check if the request method is supported
			elem= operationTags[i].getAttribute("method");
			if(elem!=="GET")
			{
				reason= DonaCadenaLang({"cat":"M�tode d'operaci� '"+elem+"' no acceptat (nom�s GET �s acceptat actualment)",
									"spa":"M�todo de operaci�n '"+elem+"' no aceptado (s�lo GET es soportado actualmente)",
									"eng":"Non supported operation method '"+elem+"' (only GET is currently supported)",
									"fre":"M�thode d'op�ration '"+elem+"' non accept�e (seulement 'GET' est actuellement support�e)"});
				continue;
			}
			
			//Get the minimum required data to make the layer work: server, version and type
			//We obtain the data from the requestURL
			elem= operationTags[i].getAttribute("href");
			if(!elem)
			{
				reason= DonaCadenaLang({"cat":"L'atribut 'href' no s'ha trobat en l'operaci�, la 'requestURL' no es pot obtenir.",
										"spa":"El atributo 'href' no se encontr� en la operaci�n, la 'requestURL' no se puede obtener",
										"eng":"Attribute 'href' was not found in the operation, the 'requestURL' cannot be obtained",
										"fre":"L'attribut 'href' n'a pas �t� trouv� dans l'op�ration, le 'requestURL' ne peut pas �tre obtenu"});
				continue;
			}
		
			if(!myTileMatrixSet)
			{
				myTileMatrixSet= MMnewTileMatrixSetFromImageURL(elem);
				//Set the CRS obtaining it from the myOffering
				if(bBox && bBox.CRS)
					myTileMatrixSet.CRS= bBox.CRS.name;
				else
					myTileMatrixSet.CRS= ParamOWSC.defaultCRS;

				//Retrieve the mime type of the answer
				elem= operationTags[i].getAttribute("type");
				if(elem)
					myOffering.mime= elem;
				else
					myOffering.mime= "image/"+MMgetFileExtension(myTileMatrixSet.URLTemplate);

				//At least we have one supported operation
				isSupported= true;
			}
			//Add this operation image to the Tile list in order to compose a TileMatrix
			x= tilesWidth.length;
			
			tilesWidth[x]= parseFloat(operationTags[i].getAttribute("owcht:width"));
			tilesHeight[x]= parseFloat(operationTags[i].getAttribute("owcht:height"));
			tilesTop[x]= parseFloat(operationTags[i].getAttribute("owcht:top"));
			tilesLeft[x]= parseFloat(operationTags[i].getAttribute("owcht:left"));
			tilesOpacity[x]= parseFloat(operationTags[i].getAttribute("owcht:opacity"));
		}
	}
	if(!isSupported)
		myOffering.nonSupported= reason;
	else
	{
		myOffering.tileMatrixSet= myTileMatrixSet;
		myOffering.symbology= myTileMatrixSet.symbology;
		myOffering.i_symbology= 0;
		myOffering.layerId= myTileMatrixSet.layer;
		myOffering.server= myTileMatrixSet.server;
		
		//Now the TileMatrix array must be filled, at least with one TileMatrix
		/*myTileMatrixSet.TileMatrix= new Array(new CreaTileMatrix(myTileMatrixSet.tileMatrixName,
			714285.71428571,
			{"x": 258007.339, "y": 4751992.66},
			640,480,3,3)
		);*/
		myTileMatrixSet.TileMatrix=[{"Identifier": myTileMatrixSet.tileMatrixName, "costat": 714285.71428571, "TopLeftPoint": {"x": 258007.339, "y": 4751992.66}, "TileWidth": 640, "TileHeight": 480, "MatrixWidth": 3, "MatrixHeight": 3}];
	}
}
/*
Standard doubts: What's the difference between an offering and an operation?
Why everyone can have zero or more of the other?
 - I found the answer myself: Each offering envelopes all the operations you can
do with a determined format. This is, for each entry, the data can be served
in more than one different format.
If there are 2 or more offerings... which one should I choose for the entry?
 - In practice I doubt that happens often, but in principle all should be listed.
*/
function parseOffering(tag,myOWSCLayer)
{
	var myOffering= new Offering(myOWSCLayer),
		elem,
		i;

	elem= tag.getAttribute("code");
	if(!elem)
		throw DonaCadenaLang({"cat":"Falta l'atribut obligatori 'code' en l' 'offering' de "+tag,
							"spa":"Falta el atributo obligatorio 'code' en el 'offering' de "+tag,
							"eng":"Missing mandatory 'code' attribute on offering "+tag,
							"fre":"Manque l'attribut obligatoire 'code' sur l' 'offereing' de "+tag});

	myOffering.code= elem;
	//Process the 'code' attribute to get the type of offering
	i= elem.lastIndexOf("/");
	if(-1===i)
		myOffering.typeName= elem.toUpperCase();
	else
		myOffering.typeName= elem.substr(i+1,elem.length-i-1).toUpperCase();

	//Select the proper offering parser depending on the offering type
	switch(myOffering.typeName)
	{
		case "WMS": parseWMSOffering(tag,myOffering); break;
		case "WMTS": parseWMTSOffering(tag,myOffering); break;
		default: myOffering.nonSupported= DonaCadenaLang({"cat":"Tipus d''offering' no acceptat: '"+myOffering.typeName+"'",
														"spa":"Tipo de 'offering' no soportado: '"+myOffering.typeName+"'",
														"eng":"Non supported offering type: '"+myOffering.typeName+"'",
														"fre":"Type d' 'offering' non support�: '"+myOffering.typeName+"'"});
	}

	//Add the new offering to the layer offering list
	myOWSCLayer.offerings[myOWSCLayer.offerings.length]= myOffering;
	
	if(myOffering.operationsHTML.length)
		return myOffering.typeName+"<ul><li>"
			+myOffering.operationsHTML.join("</li><li>")
			+"</li></ul>";
	else
		return myOffering.typeName;
}
function parseActive(attribute,OWSCObject)
{
	//In order to be active, this tag should provide a schema (the attribute
	//argument), and a second attribute expressing if the layer is active or not.
	//We understand active in the sense of visible and quaryble.
	if(attribute.nodeValue==="http://www.opengis.net/owc/active")
	{
		try
		{
			var term= attribute.ownerElement.attributes;
			term= term.getNamedItem("term");
			if(term && term.nodeValue)
			{
				if(term.nodeValue==="false")
					OWSCObject.active= false;
				if(term.nodeValue==="true")
					OWSCObject.active= true;
			}
		}
		catch(e)
		{
			//IE8 cannot get the parent node from an attribute...
		}
	}
	//Default is Active===true (see OWSCLayer definition)
	return "";
}
function parseTag(aTags,tagField,root,OWSCObject)
{
	var elem,i,j,
		newHTML= "",
		auxHTML,
		shown,
		attMatch,
		attValueMatch,
		attRetrieved;

	//Loop the tags looking for all the existing ones, and checking the
	//validity of the mandatory ones.
	for(i=0;i<aTags.length;i+=tagField.size)
	{
		shown= false; //Controls if a value has been shown and therefore the field must be closed
		elem=DonamElementsNodeAPartirDelNomDelTag(root, null, aTags[i+tagField.namespace], aTags[i+tagField.name],true);
		//We get only those tags that has as direct parent root
		elem= MMnodeListFilterByParent(elem,root);
		if(!elem || !elem[0] || elem[0].childNodes.length<1)
		{
			//It may happens that it has no childNodes because it is an attribute node we are looking for
			if(aTags[i+tagField.useAttribute] && elem && elem[0])
			{
				//There are two options of attribute match:
				//if an string: simply match an attribute with that name and retrieve its value
				//if an Array: match attribute name with first element, and attribute value,
				//             with second element and then retrieve the value of the attribute
				//             matching with third element.
				if(aTags[i+tagField.useAttribute] instanceof Array)
				{
					if(aTags[i+tagField.useAttribute].length!==3)
						throw "Field for OWSC matching attribute array "+i+" must be 3";
					attMatch= aTags[i+tagField.useAttribute][0]; //Key attribute match
					attValueMatch= aTags[i+tagField.useAttribute][1]; //Value attribute match
					attRetrieved= aTags[i+tagField.useAttribute][2]; //Key attribute holding the value
					//Save the attribute search for later match of more attributes
					auxHTML= elem;
					if(!auxHTML.length)
						elem= null;
					//Look for the tag with this attribute combination
					else for(j=auxHTML.length;j--;)
					{
						elem= auxHTML[j].attributes.getNamedItem(attMatch);
						//If we find a match we exit the for
						if(elem && elem.nodeValue && attValueMatch===elem.nodeValue)
						{
							elem= auxHTML[j].attributes; //Retrieve sibling attribute
							break;
						}
						elem= null; //To check if for ends before
					}
				}
				else
				{
					attRetrieved= aTags[i+tagField.useAttribute];
					attValueMatch= null;
					elem= elem[0].attributes;
				}
				
				//In case it has the attribute it is supposed to have, we add the attribute value to the info box
				if(elem && elem.length)
				{
					elem= elem.getNamedItem(attRetrieved);
					if(elem && elem.nodeValue)
					{
						newHTML+= aTags[i+tagField.shownFieldName];
						//Parse the value or add it to the HTML
						if(aTags[i+tagField.valueParser])
							newHTML+= aTags[i+tagField.valueParser](elem,OWSCObject); //Call the parser function
						else
							newHTML+= elem.nodeValue;
						newHTML+= "<br/>";
						shown= true;
					}
					else
						elem= 0;
				}
				else
					elem= 0;
				if(!elem)
				{
					//Is it a mandatory attribute?
					if(aTags[i+tagField.isMandatory])
						throw DonaCadenaLang({"cat":"Etiqueta incomplerta","spa":"Etiqueta incompleta","eng":"Incomplete tag", "fre":"�tiquette incompl�te"})+": '"
							+aTags[i+tagField.name]+"'\n"
							+DonaCadenaLang({"cat":"Manca atribut","spa":"Falta atributo","eng":"Missing attribute", "fre":"Manque attribut"})+": '"
							+attRetrieved+"'";
					else if(aTags[i+tagField.defaultValue])
						newHTML+= aTags[i+tagField.defaultValue]; //Add the default text
				}
			}
			else
			{
				//It's this tag mandatory? Then throw an error...
				if(aTags[i+tagField.isMandatory])
					throw DonaCadenaLang({"cat":"Manca etiqueta obligat�ria","spa":"Falta etiqueta obligatoria","eng":"Missing mandatory tag", "fre":"Manque �tiquette obligatorire"})+": '"+aTags[i+tagField.name]+"'";
				else if(aTags[i+tagField.defaultValue])
					newHTML+= aTags[i+tagField.defaultValue]; //Add the default text
			}
		}
		//Check if we require nested tags inside this tag (like: <author><name>Daniel D�az</name><name>Joan Mass�</name></author>)
		else if(aTags[i+tagField.nestedTag])
		{
			//Get all the nestedTag elements of 'elem'
			elem=DonamElementsNodeAPartirDelNomDelTag(elem[0], null, aTags[i+tagField.namespace], aTags[i+tagField.nestedTag]);
			//Have we found some neted tags?
			if(!elem || !elem.length)
			{
				//Check if this is mandatory, and throw if, or add the default value if not
				if(aTags[i+tagField.isMandatory])
					throw aTags[i+tagField.name]+", "+DonaCadenaLang({"cat":"manquen etiquetes anidades obligat�ries","spa":"falten etiquetas anidadas obligatorias","eng":"missing mandatory nested tags", "fre":"des �tiquettes nich�es obligatoires manquantes"})+": '"+aTags[i+tagField.nestedTag]+"'";
				else if(aTags[i+tagField.defaultValue])
					newHTML+= aTags[i+tagField.defaultValue]; //Add the default text
			}
			else
			{
				newHTML+= aTags[i+tagField.shownFieldName];
				shown= true;
				//Go through the nested tags joining them by a ','
				auxHTML= [];
				for(h=0;h<elem.length;h++)
					if(elem[h].childNodes.length) //Comprovem que no sigui una etiqueta buida
						auxHTML.push(elem[h].childNodes[0].nodeValue);
				newHTML+= auxHTML.join(", ")+"<br/>";
			}
		}
		else
		{
			//Add the field name (including the field format)
			newHTML+= aTags[i+tagField.shownFieldName];
			//Parse the value or add it to the HTML
			if(aTags[i+tagField.valueParser])
				newHTML+= aTags[i+tagField.valueParser](elem[0],OWSCObject);
			else
				newHTML+= elem[0].childNodes[0].nodeValue;
			newHTML+= "<br/>";
			shown= true;
		}

		//Close the field
		if(shown && aTags[i+tagField.fieldClosing])
			newHTML+= aTags[i+tagField.fieldClosing];
	}
	
	return newHTML;
}
//Makes the list items to appear
function unfoldEntry(self,event)
{
	if(-1!==self.className.search("unfoldableByClick"))
		self.className= self.className.replace("unfoldableByClick","foldableByClick");
	else
		self.className= self.className.replace("foldableByClick","unfoldableByClick");
}
//OWSCLayer constructor
function OWSCLayer(myOWSCDocument)
{
	this.OWSC= myOWSCDocument;
	this.active= true; //Standard default behaviour
	this.getCRS= function(){
		if(this.where)
			return this.where.CRS.name;
		else
			return this.OWSC.where.CRS.name;
	};
	this.toString= function() { return "[object OWSCLayer]"; };
	this.offerings= []; //entry offerings holder
	//Add the layer to the OWSC layer list
	myOWSCDocument.layers[myOWSCDocument.layers.length]= this;
}
/*
 * Changes between 2 images. The commute state is controled by controlProperty
 * in thisLayer, and the two images commuted correspond to those of imgArray,
 * being first image that of true state and second one false state.
 * A title for the image to show a tooltip can be set with toolTipArray.
 * @param {HTMLImgElement} self
 * @param {Array} imgArray (2 strings to source)
 * @param {int} thisLayerId (index of the layer in the current OWSCDocument)
 * @param {bool} controlProperty
 * @param {Array} toolTipArray (2 strings with a tooltip title)
 * @param {Event} event
 */
function MMcommuteImage(self,imgArray,thisLayerId,controlProperty,toolTipArray,event)
{
	var thisLayer= OWSCDocument.layers[thisLayerId];

	if(thisLayer[controlProperty])
	{
		self.src= imgArray[1];
		thisLayer[controlProperty]= false;
		if(toolTipArray)
			self.title= toolTipArray[1];
	}
	else
	{
		self.src= imgArray[0];
		thisLayer[controlProperty]= true;
		if(toolTipArray)
			self.title= toolTipArray[0];
	}
	if(event)
		dontPropagateEvent(event);
}
/*
 * Very simple HTML link generator from an url.
 * 
 * @param {XMLNode} url
 * @param {OWSCLayer} myOWSCLayer
 * @returns {String}
 */
function MMcreateHTMLLink(hrefNode,myOWSCLayer)
{
	return "<a href=\""+hrefNode.nodeValue+"\">"+hrefNode.nodeValue+"</a>";
}
var OWSCDocument= {title:null,where:null}; //This object will be instantiate for further processing
function LlegeixIAplicaOWSContext(doc,myDocument)
{
var root,entries,i,
error,
hasDisabled= false,
myBox=myDocument.getElementById("OWSC_previewer"),
/*
The order of the array determines the order in which the fields are shown.
Tags info format: tagName,isMandatoryTag?,useAttribute,shownFieldName,fieldClosing,defaultValue
The field name can be formated by 'shownFieldName' while the field value may be formated by combination of 'shownFieldName' and 'fieldClosing'
useAttribute means an attribute with the name of the passed string is looked for within the Tag (that means the array can have more than
one entry with the same TagName). If this parameter is an array, the match will happen if second element of the array
corresponds to the value of an attribute with name matching to the array's first element. The output value choosen will be
taken from a third element in the array, matching with another attribute.
I set an enumerator (tagField) in order to clearly/easily access to the fields of the array.
Explanation of the array field:
name: (string) tag name used in the XML file
isMandatory: (bool) true if the file must not be processed if this field is missing (otherwise false)
useAttribute: (string) look for this attribute inside the tag name and use this value (set to 0 if no attribute should be searched)
	(note that there can be more than one entry in the array with the same tag name but different useAttribute)
nestedTag: (string) this tag can have more than one element established by the tag nestedTag and separated by a comma
shownFieldName: (string) HTML code of the field start
fieldClossing: (string) HTML code of the field end, or 0 if there's nothing to add
valueParser: (function pointer) The string value of the tag is used as argument of this function and the result is shown (0 for non further processing).
defaultValue: (string) HTML to use instead of shownFieldName+value+fieldClosing in case the tag is not found or not valid
*/
fieldNameStart= "<span class=\"fieldName\">",
fieldNameClose= ":</span> ",
tagField= {namespace:0,name:1,isMandatory:2,useAttribute:3,nestedTag:4,shownFieldName:5,fieldClosing:6,valueParser:7,defaultValue:8,size:9},
specificationTags=[
//0,		1,				2,	3,	4,	5,	6,7
"*",	"title",		true,	0,	0,	"<h3 class=\"floatingWindowText\">","</h3>",function(tag) { OWSCDocument.title= tag.firstChild.nodeValue; return OWSCDocument.title; },0,
"*",	"subtitle",		false,	0,	0,	"",0,0,0,//DonaCadenaLang({"cat":"Descripci�","spa":"Descripci�n","eng":"Description","fre":"Descriptif"})0,0,
//"*",	"category",		true,"term",0,	fieldNameStart+DonaCadenaLang({"cat":"Especificaci�","spa":"Especificaci�n","eng":"Specification","fre":"Sp�cification"})+fieldNameClose,0,0,0,
//"*",	"lang",		true,	0,	0,	DonaCadenaLang({"cat":"Idioma","spa":"Idioma","eng":"Language", "fre":"Langue"}),0,0, Seems to be inserted as an attribute of feed...
//"*",	"id",			true,	0,	0,	fieldNameStart+"Id"+fieldNameClose,0,0,0,
"*",	"updated",		true,	0,	0,	fieldNameStart+DonaCadenaLang({"cat":"Data","spa":"Fecha","eng":"Date","fre":"Date"})+fieldNameClose,0,parseOWSCDate,0,
"*",	"author",		false,	0,"name",fieldNameStart+DonaCadenaLang({"cat":"Autoria","spa":"Autor�a","eng":"Authorship","fre":"Paternit�"})+fieldNameClose,0,0,0,
"dc",	"publisher",	false,	0,	0,	fieldNameStart+DonaCadenaLang({"cat":"Editor","spa":"Editor","eng":"Publisher", "fre":"�diteur"})+fieldNameClose,0,0,0,
"*",	"generator",	false,	0,	0,	fieldNameStart+DonaCadenaLang({"cat":"Generat amb","spa":"Generado con","eng":"Generated by","fre":"G�n�r� par"})+fieldNameClose,0,0,0,
//"*", "display", Only metadata, not relevant for early implementation
"*",	"rights",		false,	0,	0,	fieldNameStart+DonaCadenaLang({"cat":"Drets sobre el document de context","spa":"Derechos sobre el documento de contexto","eng":"Rights over the context document", "fre":"Les droits sur le document de contexte"})+fieldNameClose,0,0,0,
"georss","where",		false,	0,	0,	fieldNameStart+DonaCadenaLang({"cat":"�mbit","spa":"�mbito","eng":"Boundaries","fre":"Champ"})+fieldNameClose,0,function(tag) { return parseWhere(tag,OWSCDocument,null); },0,
"dc",	"dc:date",		false,	0,	0,	fieldNameStart+DonaCadenaLang({"cat":"Interval de temps","spa":"Int�rvalo de tiempo","eng":"Time resolution","fre":"R�solution temporelle"})+fieldNameClose,0,0,0 //The last comma should be removed for IE length correctness
//"category",	false,	0,	0,	fieldNameStart+DonaCadenaLang({"cat":"","spa":"","eng":"","fre":""})+fieldNameClose,0,0,0, //keyword <- not unambiguous
//"entry"
//"link"
//"extension"
],
//Same as for the feed tags, the entry tags are shown and formated following the configuration of the following array
//Reminder: {namespace:0,name:1,isMandatory:2,useAttribute:3,nestedTag:4,shownFieldName:5,fieldClosing:6,defaultValue:7,size:8},
entryTags=[
//0,		1,						2,		3,	4,	5,6,7,8
//"*","title", Written appart as the ul element
"*",	"content",		true,		0,	0,	"<li>","</li>",function(tag,myOWSCLayer) { myOWSCLayer.description= tag.firstChild.nodeValue; return myOWSCLayer.description; },0,
//"*",	"contentDescription",		true,		0,	0,	"<li>","</li>",function(tag,myOWSCLayer) { myOWSCLayer.description= tag.firstChild.nodeValue; return myOWSCLayer.description; },0, Added on 1.0r2
//"*",	"id",			true,		0,	0,	"<li>"+fieldNameStart+"Id"+fieldNameClose,"</li>",0,0,
"*",	"updated",		/*true*/false,		0,	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Data d'actualitzaci�","spa":"Fecha de actualizaci�n","eng":"Update date","fre":"Date de mise � jour"})+fieldNameClose,"</li>",parseOWSCDate,0,
"*",	"author",		false,		0,"name","<li>"+fieldNameStart+DonaCadenaLang({"cat":"Autoria","spa":"Autor�a","eng":"Autorship","fre":"Paternit�"})+fieldNameClose,"</li>",0,0,
//"*", "author", "email" <-- should be also parsed
"dc",	"publisher",	false,		0,	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Editor","spa":"Editor","eng":"Publisher","fre":"�diteur"})+fieldNameClose,"</li>",0,0,
"dc",	"creator",		false,		0,	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Creat amb","spa":"Creado con","eng":"Creator application","fre":"Cr�� avec"})+fieldNameClose,"</li>",0,0,
"*",	"rights",		false,		0,	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Drets","spa":"Derechos","eng":"Rights","fre":"Droits"})+fieldNameClose,"</li>",0,0,
"georss","where",		false,		0,	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Extensi� geoespacial","spa":"Extensi�n geoespacial","eng":"Geospatial extent","fre":"Extension g�ospatiale"})+fieldNameClose,"</li>",function(tag,myOWSCLayer) { return parseWhere(tag,OWSCDocument,OWSCDocument.where); },0,
"dc",	"date",			false,		0,	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Extensi� temporal","spa":"Extensi�n temporal","eng":"Temporal extent","fre":"Extension temporelle"})+fieldNameClose,"</li>",0,0,
"*",	"link",			false,["rel","icon","href"],	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Previsualitzaci�","spa":"Previsualizaci�n","eng":"Preview","fre":"Aper�u"})+fieldNameClose+" <img src=\"","\"></li>",0,0,
"*",	"link",			false,["rel","alternate","href"],0,"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Descripci� del contingut","spa":"Descripci�n del contenido","eng":"Content description","fre":"Description du contenu"})+fieldNameClose,"</li>",MMcreateHTMLLink,0,
"*",	"link",			false,["rel","enclosure","href"],0,"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Refer�ncia al contingut","spa":"Referencia al contenido","eng":"Content by reference","fre":"Contenu par r�f�rence"})+fieldNameClose,"</li>",MMcreateHTMLLink,0,
//"*",	"offering",		Parsed in different order (see below in this list)
"*",	"category"/*"active"*/,false,"scheme",	0,	"","",parseActive,0, //Only required to set active (visibility) property not to be shown as text
"*",	"link",			false,["rel","via","href"],	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Metadades de la font","spa":"Metadatos de la fuente","eng":"Source metadata","fre":"M�tad�nn�es de source"})+fieldNameClose,"</li>",MMcreateHTMLLink,0,
//"*",	"category",		true,"term",0,	fieldNameStart+DonaCadenaLang({"cat":"Especificaci�","spa":"Especificaci�n","eng":"Specification","fre":"Sp�cificaction"})+fieldNameClose,0,0,0,
"owc",	"minScaleDenominator",false,0,0,"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Escala m�nima de visualitzaci�","spa":"Escala m�nima de visualizaci�n","eng":"Minimum display scale", "fre":"�chelle d'affichage minimale"})+fieldNameClose,"</li>",0,0,
"owc",	"maxScaleDenominator",false,0,0,"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Escala m�xima de visualitzaci�","spa":"Escala m�xima de visualizaci�n","eng":"Maximum display scale","fre":"�chelle d'affichage maximale"})+fieldNameClose,"</li>",0,0,
//"*", "folder", Not implemented (lack of time)
"owc",	"offering",		false,		0,	0,	"<li>"+fieldNameStart+DonaCadenaLang({"cat":"Oferta de servei ('offering')","spa":"Oferta de servicio ('offering')","eng":"Offering","fre":"Offre de services ('offering')"})+fieldNameClose,"</li>",parseOffering,0 //The last comma should be removed for IE length correctness
];

	//This will be the text to copy in myBox.innerHTML in the end.
	//Is preferable to operate over this var and assign only in the end to innerHTML
	//so the browser do not need to perform additional display until the end.
	var newHTML= "",
		auxHTML,
		cState, //Controls the checkbox state "checked"/"disabled"
		visibilityImageArray= ['is_visible.gif','not_visible.gif'],
		visibilityToolTipArray= [DonaCadenaLang({"cat":"La capa estar� activa i visible","spa":"La capa estar� activa y visible","eng":"Layer will be active and visible","fre":"La couche sera active et visible"}), //Active title
			DonaCadenaLang({"cat":"La capa no estar� visible","spa":"La capa no estar� visible","eng":"Layer will be not visible","fre":"La couche ne sera pas visible"})], //Non active title
		myOWSCLayer;
	
	OWSCDocument.url= doc.baseURI;
	OWSCDocument.layers= [];

	//Check if the OWSC window is still open...
	//Pendant...
	//try
	{
		//Check if the arrays have been properly constructed:
		if(specificationTags.length%tagField.size)
			auxHTML= "specificationTags";
		else if(entryTags.length%tagField.size)
			auxHTML= "entryTags";
		if(auxHTML)
			throw "JS coding error: The '"+auxHTML+"' array have not been properly constructed. Some field has a number of elements different than '"+tagField.size+"'."+specificationTags.length+" "+tagField.size+" "+(specificationTags.length%tagField.size);

		//Get the root node 'feed' (check if this is a valid OWSC file)
		if(doc)
			root=DonamElementsNodeAPartirDelNomDelTag(doc, null, "*", "feed");
		if(!root || root.length<1)
		{
			throw DonaCadenaLang({"cat":"El document de context OWS no t� \"feed\" com a node arrel.",
								"spa":"El documento de contexto OWS no tiene \"feed\" como nodo raiz.",
								"eng":"The OWS context document does not have \"feed\" as a root node.",
								"fre":"Le document de context OWS n'a pas \"feed\" comme un noeud racine."});
		}
		else
			root= root[0];

		//Parse the specificationTags in order to get all the relevant information from <feed>
		newHTML+= parseTag(specificationTags,tagField,root,OWSCDocument);

		//Now, check for entry layers and show them to the user
		newHTML+= "<h3 class=\"floatingWindowText\">"
			+DonaCadenaLang({"cat":"Capes de la vista","spa":"Capas de la vista","eng":"Layers on this view","fre":"Couches sur ce point de vue"})
			+":</h3><form action=\"\" onsubmit=\"OpenmyOWSCLayers(this); return false;\">"; //Capture the submit event
		entries=DonamElementsNodeAPartirDelNomDelTag(root, null, "*", "entry");
		for(i=0;i<entries.length;i++)
		{
			//New OWSCLayer instance for this entry...
			myOWSCLayer= new OWSCLayer(OWSCDocument);
			//Go through the entry tags and show them as stated in the entryTags array
			//Should be done now, so myOWSCLayer get the proper values
			auxHTML= parseTag(entryTags,tagField,entries[i],myOWSCLayer);
			myOWSCLayer.title=DonamElementsNodeAPartirDelNomDelTag(entries[i], null, "*","title")[0].childNodes[0].nodeValue;
			
			//Now check if the layer is openable
			error= isOpenableLayer(myOWSCLayer);
			if(!error)
			{
				newHTML+= "<ul class=\"unfoldableByClick\" onclick=\"unfoldEntry(this)\">";
				cState= "checked";
			}
			else
			{
				newHTML+= "<ul class=\"unfoldableByClick disabled\" title=\""+error+"\" onclick=\"unfoldEntry(this)\">";
				cState= "disabled";
				hasDisabled= true; //The context document has non openable layers
			}
			
			newHTML+= 
				//Controls before the layer name
				//The next span is required in order to avoid the unfoldEntry() function when
				//checking/unchecking the checkbox. A better solution would be to place the
				//checkbox outside the <ul> but that desaligns the checbox from the entry title.
				"<span onclick=\"dontPropagateEvent(arguments[0] || window.event)\">"
				+"<input type=\"checkbox\" name=\"layer\" value=\""+i+"\" "+cState+"></span>";
			
			//In case the layer is active, add Visibility image
			if(!hasDisabled)
			{
				newHTML+= "<img id=\"visibility\" class=\"clickable\"";
				if(myOWSCLayer.active)
					newHTML+= "src=\""+visibilityImageArray[0]+"\" \
						title=\""+visibilityToolTipArray[0]+"\"";
				else
					newHTML+= "src=\""+visibilityImageArray[1]+"\" \
						title=\""+visibilityToolTipArray[1]+"\"";
				//The arguments are transformed to strings because otherwise during the
				//event execution local variables will not exist, and global variables
				//will refer only to the last layer.
				newHTML+= " onclick=\"MMcommuteImage(this,['"+visibilityImageArray[0]+"','"+visibilityImageArray[1]+"'],"
					+i+",'active',['"+visibilityToolTipArray[0]+"','"+visibilityToolTipArray[1]+"'],event);\"> ";
			}
			else
				newHTML+= " ";
		
			newHTML+= myOWSCLayer.title
				+auxHTML
				//Close this entry list
				+"</ul>";
		}
		
		//Add message explaining the meaning of the 'grey style layers'.
		if(hasDisabled)
			newHTML+= "<ul class=\"floatingWindowNote disabled\">"
				+DonaCadenaLang({"cat":"Les capes inactives no es poden obrir (moure el punter per sobre del nom mostrar� una descripci� del motiu).",
								"spa":"Las capas inactivas no se pueden abrir (mover el puntero por encima del nombre mostrar� una descripci�n del motivo).",
								"eng":"Disabled layers cannot be opened (move the cursor over the layer name will make appear a description of the reason).",
								"fre":"Les couches inactives ne peuvent pas �tre ouvertes (mouvoir le pointeur sur le nom montrera une description du motif)."})
				+"</ul><br>";

		//Finally, assign the newHTML written to the innerHTML tag to display it
		//and close the form
		myBox.innerHTML= newHTML
			//Add a submit button and close the form
			+"<input type=\"submit\" value=\""+DonaCadenaLang({"cat":"Afegir a vista","spa":"A�adir a vista","eng":"Add to view", "fre":"Ajoutez � la vue"})+"\" title=\""
				+DonaCadenaLang({"cat":"Afegeix les capes seleccionades a la visualitzaci� actual.",
								"spa":"A�ade las capas seleccionadas a la visualizaci�n actual.",
								"eng":"Add the selected layers to the current visualization.",
								"fre":"Ajoutez les couches choisies � la visualisation actuelle ."})+"\" onclick=\"MMFloatingWindowEnllac_close()\">"
			+"<input type=\"button\" value=\""+DonaCadenaLang({"cat":"Tancar vista i obrir","spa":"Cerrar vista y abrir","eng":"Close view and open","fre":"Fermer la vue et ovrir"})+"\" title=\""
				+DonaCadenaLang({"cat":"Tanca la visualitzaci� actual i obra una nova amb les capes seleccionades.",
					"spa":"Cierra la visualizaci�n actual y abre una nueva con las capas seleccionadas.",
					"eng":"Close the current visualization and open a new one with the selected layers.",
					"fre":"Fermez la visualisation en cours et ouvrez une nouvelle avec les couches choisies."})+"\" onclick=\"EliminaTotesLesCapes(false); OpenmyOWSCLayers(this.form); MMFloatingWindowEnllac_close()\">"
			+"<input type=\"button\" value=\""+DonaCadenaLang({"cat":"Cancel�lar","spa":"Cancelar","eng":"Cancel","fre":"Annuler"})+"\" onclick=\"MMFloatingWindowEnllac_close()\">"
			+"</form>";
	}
	/*catch(err)
	{
		auxHTML= DonaCadenaLang({"cat":"Error en processar el document de context OWS.",
			"spa":"Error al procesar el documento de contexto OWS.",
			"eng":"Error processing OWS context document.",
			"fre":"Erreur en traitant le document de contexte OWS"})+"<br><br>";
		if(err.message)
			auxHTML+= err.message;
		else if(err.description)
			auxHTML+= err.description;
		else
			auxHTML+= err;
		
		myBox.innerHTML= auxHTML;
  	}*/
}
function MMFloatingWindowEnllac_close()
{
	TancaFinestraLayer('enllac');
}

function OpenOWSContext(url_context)
{
	//Place a loading icon in the target box
    var textTarget= document.getElementById("OWSC_previewer");
    textTarget.innerHTML= "<img src=\"ajax_loader.gif\" alt=\"Loading...\">";

	/*
	 * This code can be used for tests when you are loading the client in local mode, without network
	var xmlobject,
		str= "<?xml version=\"1.0\"?>"
+"<feed xml:lang=\"castellano\">"
+"<category label=\"This file is compliant with version 1.0 of OGC Context\" scheme=\"http://www.opengis.net/spec/owc/specReference\" term=\"http://www.opengis.net/spec/owc/1.0/req/atom\"/>"
+"<id>file:///C:/Documents%20and%20Settings/-/Mis%20documentos/MiramonMapNavigator/index.htm::Navegador de Proves per Desenvolupament del Daniel</id>"
+"<title>Navegador de Proves per Desenvolupament del Daniel</title>"
+"<updated>2013-01-12T17:22:21.851Z</updated>"
+"<generator>MiraMap Navigator v.5.4</generator>"
+"<entry>"
	+"<id>file:///C:/Documents%20and%20Settings/-/Mis%20documentos/MiramonMapNavigator/index.htm::L�mites administrativos</id>"
	+"<title>L�mites administrativos</title>"
	+"<content type=\"html\">L�mites administrativos</content>"
	+"<updated>2013-01-12T17:22:21.851Z</updated>"
	+"<offering code=\"http://www.opengis.net/spec/owc/1.0/req/atom/wms\">"
		+"<operation code=\"GetCapabilities\" href=\"http://localhost/cgi-bin/MiraMon.cgi?REQUEST=GetCapabilities&amp;VERSION=1.1.1&amp;SERVICE=WMS\" method=\"GET\"/>"
		+"<operation code=\"GetMap\" href=\"http://localhost/cgi-bin/MiraMon.cgi?REQUEST=GetMap&amp;VERSION=1.1.1&amp;SERVICE=WMS&amp;FORMAT=image/gif&amp;TRANSPARENT=TRUE&amp;CRS=EPSG:4326&amp;LAYERS=limites_admin&amp;BBOX=-128948,672052,3829298,4126298\" method=\"GET\"/>"
	+"</offering>"
+"</entry>"
+"</feed>",
		elem;
	
	try
	{
		xmlobject=(new DOMParser()).parseFromString(str,"text/xml");
	}
	catch(e)
	{
		//IE8 and previous
		xmlobject=new ActiveXObject("Microsoft.XMLDOM");
		xmlobject.loadXML(str);
	}

	LlegeixIAplicaOWSContext(xmlobject,document);
	return {};
	*/

	//And Ajax load the OWSC file
	ajax[0]=new Ajax();
    //We set a function to handle errors in case the ajax can not download the XML
    ajax[0].setHandlerErr(function(resp)
			{
				textTarget.innerHTML= DonaCadenaLang({"cat":"El document de context no s'ha pogut carregar: ",
												"spa":"El documento de contexto no se ha podido cargar: ",
												"eng":"It was not possible to load the context document: ",
												"fre":"Il n'�tait pas possible de charger le document de contexte: "})
										+"<a href=\""+url_context+"\">"+url_context+"</a>"
										+"<br>Error: "+this.responseText; });
	ajax[0].doGet(url_context, LlegeixIAplicaOWSContext, "text/xml",document);
}

/*
 * Returns a string representing the required GetCapabilities URL request.
 **/
function getServiceRequestURL(thisLayer,thisRequest)
{
var thisService;
var tipusServidorCapa=DonaTipusServidorCapa(thisLayer.tipus);
	
	if (tipusServidorCapa=="TipusWMS" || tipusServidorCapa=="TipusWMS_C")
		thisService= "WMS";
	else if (tipusServidorCapa=="TipusWMTS_REST" || tipusServidorCapa=="TipusWMTS_SOAP" || tipusServidorCapa=="TipusWMTS_KVP")
		thisService= "WMTS";
	else if (tipusServidorCapa=="TipusWFS") 
		thisService= "WFS";
	else
		throw "Service type "+DonaTipusServidorCapa(thisLayer.tipus)+" not supported.";

	switch(thisRequest)
	{
		case "GetCapabilities":
			return AfegeixNomServidorARequest(DonaServidorCapa(thisLayer.servidor),"REQUEST=GetCapabilities&VERSION="+DonaVersioServidorCapa(thisLayer.versio).Vers+"."+DonaVersioServidorCapa(thisLayer.versio).SubVers+"."+DonaVersioServidorCapa(thisLayer.versio).VariantVers+"&SERVICE="+thisService,false);
		case "GetMap":
			return AfegeixNomServidorARequest(DonaServidorCapa(thisLayer.servidor),"REQUEST=GetMap"
				+"&VERSION="+DonaVersioServidorCapa(thisLayer.versio).Vers+"."+DonaVersioServidorCapa(thisLayer.versio).SubVers+"."+DonaVersioServidorCapa(thisLayer.versio).VariantVers
 				+"&SERVICE="+thisService
 				+"&FORMAT="+thisLayer.FormatImatge
 				+"&TRANSPARENT="+(thisLayer.transparencia && thisLayer.transparencia!="opac" ? "TRUE":"FALSE")
 				+"&CRS="+(thisLayer.CRS ? thisLayer.CRS:ParamOWSC.defaultCRS)
 				+"&LAYERS="+thisLayer.nom
				//El codi anterior no �s correcte si la versi� �s la 1.3 i el sistema �s lat/long i cal revisar-lo 05/12/2015 (JM)  �$�
 				+"&BBOX="+ParamInternCtrl.vista.EnvActual.MinX+","+ParamInternCtrl.vista.EnvActual.MinY+","+ParamInternCtrl.vista.EnvActual.MaxX+","+ParamInternCtrl.vista.EnvActual.MaxY
				+"&WIDTH="+ParamInternCtrl.vista.ncol
				+"&HEIGHT="+ParamInternCtrl.vista.nfil
 				,false);
		default:
			throw "Non supported request type "+thisRequest+".";
	}
}
function createOWSCFile(thisForm)
{
	var textTarget,
		xmlobject,
		root, //The feed tag
		elem, //A XML Element object
		entry, //A XML Element object representing an atom entry
		offering, //A XML Element object representing an owc offering
		str, //A string var
		currentDate,
		downloadRegion,
		i, //An iterator var
		xmlHeader= "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n\
			<feed xmlns=\"http://www.w3.org/2005/Atom\"\n\
				xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n\
				xmlns:georss=\"http://www.georss.org/georss\"\n\
				xmlns:gml=\"http://www.opengis.net/gml\"\n\
				xmlns:owc=\"http://www.opengis.net/owc/1.0\"\n\
				xml:lang=\"en\">\n\
				<link rel=\"profile\"\n\
					href=\"http://www.opengis.net/spec/owc-atom/1.0/req/core\"\n\
					title=\"This file is compliant with version 1.0 of OGC Context\"/></feed>";


	//We create a download region where the final download link will appear
	downloadRegion= document.createElement("div");
	thisForm.parentNode.appendChild(downloadRegion);
	elem= document.createElement("img");
	elem.setAttribute("src","ajax_loader.gif");
	elem.setAttribute("alt","Generating OWSC document...");
	downloadRegion.appendChild(elem);

	try
	{
		//var doctype= document.implementation.createDocumentType("text/xml","http://www.w3.org/2005/Atom","http://www.w3.org/2005/Atom");
		xmlobject=(new DOMParser()).parseFromString(xmlHeader,"text/xml");
		currentDate= DonaDateComATextISO8601(new Date()); //For RFC3339 Date Timestamp
	}
	catch(e)
	{
		//IE8 and lower
		xmlobject=new ActiveXObject("Microsoft.XMLDOM");
		xmlobject.loadXML(xmlHeader);
		//IE8 is not compliant and do not support the RFC3339 Date Timestamp
		currentDate= (new Date()).toUTCString();
	}

	root=xmlobject.getElementsByTagName("feed")[0],

	elem= MMaddElement(xmlobject,root,"category",null);
	elem.setAttribute("rel","profile");
	elem.setAttribute("href","http://www.opengis.net/spec/owc-atom/1.0/req/core");
	elem.setAttribute("title","This file is compliant with version 1.0 of OGC Context");
	if(thisForm.language.value)//selectedIndex
		root.setAttribute("xml:lang",thisForm.language.value.substr(0,2)); //Review...
	else
		root.setAttribute("xml:lang","und");
	MMaddElement(xmlobject,root,"id",document.URL+"::"+thisForm.title.value);
	if(thisForm.title.value)
		MMaddElement(xmlobject,root,"title",thisForm.title.value);
	else
		alert(DonaCadenaLang({"cat":"El teu document OWSC no ser� compatible amb l'est�ndard ja que no has proporcionat un t�tol v�lid.",
							"spa":"Su documento OWSC no ser� compatible con el est�ndar ya que no ha proporcionado un t�tulo v�lido.",
							"eng":"Your OWSC document will not be standard compliant as you have not provided a valid title.",
							"fre":"Votre document OWSC ne sera pas conforme avec le norme car vous n'avez pas fourni un titre valable."}));
	if(thisForm.subtitle.value)
		MMaddElement(xmlobject,root,"subtitle",thisForm.subtitle.value);
	MMaddElement(xmlobject,root,"updated",currentDate);
	if(thisForm.author.value)
		MMaddElement(xmlobject,root,"author",thisForm.author.value);
	if(thisForm.publisher.value)
		MMaddElement(xmlobject,root,"dc:publisher",thisForm.publisher.value);
	MMaddElement(xmlobject,root,"generator",clientFullName());
	if(thisForm.rights.value)
		MMaddElement(xmlobject,root,"rights",thisForm.rights.value);
	elem= MMaddElement(xmlobject,root,"georss:where",null);
	EnvolupantToGml(ParamInternCtrl.vista.EnvActual).addToGeoRSS(xmlobject,elem);
	//Pendant: dc:date
	//Pendant: category (for keywords) Not clear to me how it works...

	//Start to add entries to the document:
	for(i=0;i<ParamCtrl.capa.length;i++)
	{
		//Non visible layers won't be added to the OWSC document
		if(ParamCtrl.capa.visible!=="no")
		{
			entry= MMaddElement(xmlobject,root,"entry");
			str= DonaCadena(ParamCtrl.capa[i].DescLlegenda);
			if(!str)
				str= DonaCadena(ParamCtrl.capa[i].desc) ? DonaCadena(ParamCtrl.capa[i].desc):"NoNamed";
			MMaddElement(xmlobject,entry,"id",document.URL+"::"+str);
			MMaddElement(xmlobject,entry,"title",str);
			elem= MMaddElement(xmlobject,entry,"content",DonaCadena(ParamCtrl.capa[i].desc));
			elem.setAttribute("type","html");
			//Set layer as active or non-active
			elem= MMaddElement(xmlobject,entry,"category");
			elem.setAttribute("scheme","http://www.opengis.net/spec/owc/active");
			elem.setAttribute("term",ParamCtrl.capa[i].visible=="ara_no" ? "false":"true");
			//Maybe it should better be a date of when the entry was produced?
			MMaddElement(xmlobject,entry,"updated",currentDate);
			//Now add the offerings for this entry
			//Only WMS is implemented for now, so go straight to GetCapabilities and GetMap
			offering= MMaddElement(xmlobject,entry,"owc:offering");
			offering.setAttribute("code","http://www.opengis.net/spec/owc-atom/1.0/req/wms");
			elem= MMaddElement(xmlobject,offering,"owc:operation",null);
			elem.setAttribute("code","GetCapabilities");
			elem.setAttribute("href",getServiceRequestURL(ParamCtrl.capa[i],"GetCapabilities"));
			elem.setAttribute("method","GET"); //Should support other methods?
			elem= MMaddElement(xmlobject,offering,"owc:operation",null);
			elem.setAttribute("code","GetMap");
			elem.setAttribute("href",getServiceRequestURL(ParamCtrl.capa[i],"GetMap"));
			elem.setAttribute("method","GET"); //Should support other methods?
		}
	}

	try
	{
		str= new XMLSerializer().serializeToString(xmlobject);
	}
	catch(e)
	{
		//IE previous to IE9
		str= xmlobject.xml;
	}

	if (true)//Can URI
	{
		//The replace is required so data inside do not break the '' of the a link
		downloadRegion.innerHTML= "<a href=\"data:text/xml;charset=UTF-8,"+encodeURIComponent(str)+"\"><img src='download.gif' style='height:24px;'> "
			+DonaCadenaLang({"cat":"Descarrega document OWSC","spa":"Descarga documento OWSC","eng":"Download OWSC document", "fre":"T�l�chargez document OWSC"})+"</a>";
	}
	else
	{
		//As there is cross browser straight forward way to save an XML file into
		//the client hard disk. We load a blank window and write there the XML
		//so the user can save it with the browser "save as" option.
		//Maybe is possible to send the file to the server and ask him to download.
		//(will look better for the user-side).
		alert("A new window will be opened in your browser with the OWS Context"
			+"document. You can then save the document in that window using your browser "
			+"'Save as...' option.\n\n(It might happen that your browser renders the "
			+"document in a way that you cannot see the tags. Open the source code view "
			+"or save the document to fully visualize the content.)");
		textTarget= window.open("about:blank","_blank");
		textTarget.document.open("text/xml");

		try //Pretty printing the document
		{
			textTarget.document.write(XML(str).toXMLString());
		}
		catch(e)
		{
			//This will produce a not indented document
			textTarget.document.write(str);
		}
		textTarget.document.close();
	}
}
/*
 * This function creates a form in the OWSC_previewer to save the current
 * map browser state.
 */
function SaveOWSContext(url_context)
{
    var textTarget= document.getElementById("enllac_finestra"),
		//I use this list in order to keep the form code cleaner:
		f={
			"lang":[DonaCadenaLang({"cat":"Idioma del document","spa":"Idioma del documento","eng":"Document language","fre":"Langue du document"}),
				DonaCadenaLang({"cat":"Llengua en qu� s'est� documentant aquest arxiu OWS Context",
								"spa":"Idioma en el que se est� documentando este archivo OWS Context",
								"eng":"Language at which you are documenting this OWS Context file",
								"fre":"La langue � lequel vous documentez ce fichier de Contexte OWS"})],
			"titl":[DonaCadenaLang({"cat":"T�tol","spa":"T�tulo","eng":"Title","fre":"Titre"}),
				DonaCadenaLang({"cat":"Un t�tol per al document de context",
								"spa":"Un t�tulo para el documento de contexto",
								"eng":"A title for the Context document",
								"fre":"Un titre pour le document de context"})],
			"subt":[DonaCadenaLang({"cat":"Descripci�","spa":"Descripci�n","eng":"Description","fre":"Descriptif"}),
				DonaCadenaLang({"cat":"Descripci� de la finalitat o el contingut del document de context",
								"spa":"Descripci�n de la finalidad o el contenido del documento de contexto",
								"eng":"Description of the Context document purpose or content",
								"fre":"Description du but ou du contenu du document de context"})],
			"auth":[DonaCadenaLang({"cat":"Autor","spa":"Autor","eng":"Author","fre":"Auteur"}),
				DonaCadenaLang({"cat":"Una entitat directament responsable de crear el document de context (en general tu o la teva organitzaci�)",
								"spa":"Una entidad directamente responsable de crear el documento de contexto (por lo general usted o su organizaci�n)",
								"eng":"An entity primarily responsible for making the Context Document (usually you or your organisation)",
								"fre":"Une entit� principalement responsable de faire le document de contexte (d'habitude vous ou votre organisation)"})],
			"publ":[DonaCadenaLang({"cat":"Editor","spa":"Editor","eng":"Publisher","fre":"�diteur"}),
				DonaCadenaLang({"cat":"Identificador de l'editor del document de context",
								"spa":"Identificador del editor del documento de contexto",
								"eng":"Identifier for the publisher of the Context document",
								"fre":"Identifiant de l'�diteur du document de contexte"})],
			"righ":[DonaCadenaLang({"cat":"Drets sobre el document de context","spa":"Derechos sobre el documento de contexto","eng":"Rights over the context document","fre":"Les droits sur le document de contexte"}),
				DonaCadenaLang({"cat":"Informaci� sobre els drets continguts en i sobre el document de context",
								"spa":"Informaci�n sobre los derechos contenidos en y sobre el documento de contexto",
								"eng":"Information about rights held in and over the Context document",
								"fre":"Informations sur les droits d�tenus dans et sur le document de contexte"})],
			"":0 //For easily adding elements above without the , error
		},
		mandatoryHelp= DonaCadenaLang({"cat":"Camp obligatori","spa":"Campo obligatorio","eng":"Mandatory field","fre":"Champ obligatoire"}),
		mandatory= "<span style='color:red;' title='"+mandatoryHelp+"'>*</span>",
		elem;

	textTarget.innerHTML= "<p>"+DonaCadenaLang(
			{"cat":"L'estat actual del navegador de mapes es desar� mitjan�ant l'est�ndar de documents de context OWS. El podr� restaurar m�s tard usant el fitxer amb aquest navegador de mapes o qualsevol altre client compatible amb OWS.",
			"spa":"El estado actual del navegador de mapas se guardar� usando el est�ndar de documentos de contexto OWS. Lo podr� restaurar m�s tarde usando el archivo con este navegador de mapas o cualquier cliente compatible con OWS.",
			"eng":"The current state of the map browser will be saved using the OWS Context document standard. You may restore it later using the file in this map browser or any other OWS compliant client.",
			"fre":"L'�tat actuel du navigateur des cartes sera sauv� utilisant la norme de document de Contexte OWS. Vous pouvez le reconstituer pour utiliser plus tard le fichier dans ce navigateur des cartes ou un autre client conforme OWS."})
		+"</p><p>URL actual: "+url_context+"</p>"
		+"<form onsubmit='createOWSCFile(this); return false;'>"
		+"<ul class='fieldName'>"
		+"<li>"+mandatory+f.lang[0]+": <select id='language' title='"+f.lang[1]+"' style='width:160px;'>"
			//It would be possible to read from an xml, but this way it's not necessaire to use Ajax
			+"<option value='aa'>Afar [aa]</option><option value='ab'>Abkhazian [ab]</option><option value='ae'>Avestan [ae]</option><option value='af'>Afrikaans [af]</option><option value='ak'>Akan [ak]</option><option value='am'>Amharic [am]</option><option value='an'>Aragonese [an]</option><option value='ar'>Arabic [ar]</option><option value='as'>Assamese [as]</option><option value='av'>Avaric [av]</option><option value='ay'>Aymara [ay]</option><option value='az'>Azerbaijani [az]</option><option value='ba'>Bashkir [ba]</option><option value='be'>Belarusian [be]</option><option value='bg'>Bulgarian [bg]</option><option value='bh'>Bihari languages [bh]</option><option value='bi'>Bislama [bi]</option><option value='bm'>Bambara [bm]</option><option value='bn'>Bengali [bn]</option><option value='bo'>Tibetan [bo]</option><option value='br'>Breton [br]</option><option value='bs'>Bosnian [bs]</option><option value='ca'>Catalan; Valencian [ca]</option><option value='ce'>Chechen [ce]</option><option value='ch'>Chamorro [ch]</option><option value='co'>Corsican [co]</option><option value='cr'>Cree [cr]</option><option value='cs'>Czech [cs]</option><option value='cu'>Church Slavic; Old Slavonic [cu]</option><option value='cv'>Chuvash [cv]</option><option value='cy'>Welsh [cy]</option><option value='da'>Danish [da]</option><option value='de'>German [de]</option><option value='dv'>Divehi; Dhivehi; Maldivian [dv]</option><option value='dz'>Dzongkha [dz]</option><option value='ee'>Ewe [ee]</option><option value='el'>Greek, Modern (1453-) [el]</option><option value='en'>English [en]</option><option value='eo'>Esperanto [eo]</option><option value='es'>Spanish; Castilian [es]</option><option value='et'>Estonian [et]</option><option value='eu'>Basque [eu]</option><option value='fa'>Persian [fa]</option><option value='ff'>Fulah [ff]</option><option value='fi'>Finnish [fi]</option><option value='fj'>Fijian [fj]</option><option value='fo'>Faroese [fo]</option><option value='fr'>French [fr]</option><option value='fy'>Western Frisian [fy]</option><option value='ga'>Irish [ga]</option><option value='gd'>Gaelic; Scottish Gaelic [gd]</option><option value='gl'>Galician [gl]</option><option value='gn'>Guarani [gn]</option><option value='gu'>Gujarati [gu]</option><option value='gv'>Manx [gv]</option><option value='ha'>Hausa [ha]</option><option value='he'>Hebrew [he]</option><option value='hi'>Hindi [hi]</option><option value='ho'>Hiri Motu [ho]</option><option value='hr'>Croatian [hr]</option><option value='ht'>Haitian; Haitian Creole [ht]</option><option value='hu'>Hungarian [hu]</option><option value='hy'>Armenian [hy]</option><option value='hz'>Herero [hz]</option><option value='ia'>Interlingua [ia]</option><option value='id'>Indonesian [id]</option><option value='ie'>Interlingue; Occidental [ie]</option><option value='ig'>Igbo [ig]</option><option value='ii'>Sichuan Yi; Nuosu [ii]</option><option value='ik'>Inupiaq [ik]</option><option value='io'>Ido [io]</option><option value='is'>Icelandic [is]</option><option value='it'>Italian [it]</option><option value='iu'>Inuktitut [iu]</option><option value='ja'>Japanese [ja]</option><option value='jv'>Javanese [jv]</option><option value='ka'>Georgian [ka]</option><option value='kg'>Kongo [kg]</option><option value='ki'>Kikuyu; Gikuyu [ki]</option><option value='kj'>Kuanyama; Kwanyama [kj]</option><option value='kk'>Kazakh [kk]</option><option value='kl'>Kalaallisut; Greenlandic [kl]</option><option value='km'>Central Khmer [km]</option><option value='kn'>Kannada [kn]</option><option value='ko'>Korean [ko]</option><option value='kr'>Kanuri [kr]</option><option value='ks'>Kashmiri [ks]</option><option value='ku'>Kurdish [ku]</option><option value='kv'>Komi [kv]</option><option value='kw'>Cornish [kw]</option><option value='ky'>Kirghiz; Kyrgyz [ky]</option><option value='la'>Latin [la]</option><option value='lb'>Luxembourgish; Letzeburgesch [lb]</option><option value='lg'>Ganda [lg]</option><option value='li'>Limburgan; Limburger; Limburgish [li]</option><option value='ln'>Lingala [ln]</option><option value='lo'>Lao [lo]</option><option value='lt'>Lithuanian [lt]</option><option value='lu'>Luba-Katanga [lu]</option><option value='lv'>Latvian [lv]</option><option value='mg'>Malagasy [mg]</option><option value='mh'>Marshallese [mh]</option><option value='mi'>Maori [mi]</option><option value='mk'>Macedonian [mk]</option><option value='ml'>Malayalam [ml]</option><option value='mn'>Mongolian [mn]</option><option value='mr'>Marathi [mr]</option><option value='ms'>Malay [ms]</option><option value='mt'>Maltese [mt]</option><option value='my'>Burmese [my]</option><option value='na'>Nauru [na]</option><option value='nb'>Bokmål, Norwegian [nb]</option><option value='nd'>Ndebele, North; North Ndebele [nd]</option><option value='ne'>Nepali [ne]</option><option value='ng'>Ndonga [ng]</option><option value='nl'>Dutch; Flemish [nl]</option><option value='nn'>Nynorsk, Norwegian [nn]</option><option value='no'>Norwegian [no]</option><option value='nr'>Ndebele, South; South Ndebele [nr]</option><option value='nv'>Navajo; Navaho [nv]</option><option value='ny'>Chichewa; Chewa; Nyanja [ny]</option><option value='oc'>Occitan (post 1500) [oc]</option><option value='oj'>Ojibwa [oj]</option><option value='om'>Oromo [om]</option><option value='or'>Oriya [or]</option><option value='os'>Ossetian; Ossetic [os]</option><option value='pa'>Panjabi; Punjabi [pa]</option><option value='pi'>Pali [pi]</option><option value='pl'>Polish [pl]</option><option value='ps'>Pushto; Pashto [ps]</option><option value='pt'>Portuguese [pt]</option><option value='qu'>Quechua [qu]</option><option value='rm'>Romansh [rm]</option><option value='rn'>Rundi [rn]</option><option value='ro'>Romanian; Moldavian; Moldovan [ro]</option><option value='ru'>Russian [ru]</option><option value='rw'>Kinyarwanda [rw]</option><option value='sa'>Sanskrit [sa]</option><option value='sc'>Sardinian [sc]</option><option value='sd'>Sindhi [sd]</option><option value='se'>Northern Sami [se]</option><option value='sg'>Sango [sg]</option><option value='si'>Sinhala; Sinhalese [si]</option><option value='sk'>Slovak [sk]</option><option value='sl'>Slovenian [sl]</option><option value='sm'>Samoan [sm]</option><option value='sn'>Shona [sn]</option><option value='so'>Somali [so]</option><option value='sq'>Albanian [sq]</option><option value='sr'>Serbian [sr]</option><option value='ss'>Swati [ss]</option><option value='st'>Sotho, Southern [st]</option><option value='su'>Sundanese [su]</option><option value='sv'>Swedish [sv]</option><option value='sw'>Swahili [sw]</option><option value='ta'>Tamil [ta]</option><option value='te'>Telugu [te]</option><option value='tg'>Tajik [tg]</option><option value='th'>Thai [th]</option><option value='ti'>Tigrinya [ti]</option><option value='tk'>Turkmen [tk]</option><option value='tl'>Tagalog [tl]</option><option value='tn'>Tswana [tn]</option><option value='to'>Tonga (Tonga Islands) [to]</option><option value='tr'>Turkish [tr]</option><option value='ts'>Tsonga [ts]</option><option value='tt'>Tatar [tt]</option><option value='tw'>Twi [tw]</option><option value='ty'>Tahitian [ty]</option><option value='ug'>Uighur; Uyghur [ug]</option><option value='uk'>Ukrainian [uk]</option><option value='ur'>Urdu [ur]</option><option value='uz'>Uzbek [uz]</option><option value='ve'>Venda [ve]</option><option value='vi'>Vietnamese [vi]</option><option value='vo'>Volapük [vo]</option><option value='wa'>Walloon [wa]</option><option value='wo'>Wolof [wo]</option><option value='xh'>Xhosa [xh]</option><option value='yi'>Yiddish [yi]</option><option value='yo'>Yoruba [yo]</option><option value='za'>Zhuang; Chuang [za]</option><option value='zh'>Chinese [zh]</option><option value='zu'>Zulu [zu]</option>"
			+"</select>"
		//<input id='language' type='text' title='"+f.lang[1]+"' value='"+expandLanguageName().substr(0,2)+"' style='width:70px'></li>"
		+"<li>"+mandatory+f.titl[0]+": <input id='title' type='text' title='"+f.titl[1]+"' value='"+document.title+"'></li>"
		+"<li>"+f.auth[0]+": <input id='author' type='text' title='"+f.auth[1]+"'></li>"
		+"<li>"+f.publ[0]+": <input id='publisher' type='text' title='"+f.publ[1]+"'></li>"
		+"<li>"+f.subt[0]+": <input id='subtitle' type='text' title='"+f.subt[1]+"'></li>"
		+"<li>"+f.righ[0]+": <input id='rights' type='text' title='"+f.righ[1]+"'></li>"
		+"</ul>"
		+"<p>"+mandatory+mandatoryHelp+".</p>"
		//+"<input type='submit' value='"+DonaCadenaLang({"cat":"Desar","spa":"Guardar","eng":"Save","fre":"Sauvegarder"})+"'>"
		+"<input type='submit' value='"+DonaCadenaLang({"cat":"Generar","spa":"Generar","eng":"Generate","fre":"G�n�rer"})+"'>"
		+"<input type='button' value='"+DonaCadenaLang({"cat":"Cancel�lar","spa":"Cancelar","eng":"Cancel","fre":"Annuler"})+"' onclick='MMFloatingWindowEnllac_close()'>"
		+"</form>"; 

	//Set as selected language, current user language
	elem= document.getElementById("language");
	elem.value= getISOLanguageTag();
}

function OpenmyOWSCLayers(myForm)
{
	var i,
		separator_set= null, //The layer group separator must be set only in the first layer
		myOWSC,
		myLayer,
		newLayers= [],
		bBox; //Layers bounding box

	for(i=0;i<myForm.length;i++)
	//Reverse order so last processed layer is top one
	//for(i=myForm.length;i--;)
		if(myForm.elements[i].type==="checkbox" && myForm.elements[i].checked)
		{
			myOWSC= OWSCDocument.layers[myForm.elements[i].value];

			if(!myOWSC.offerings || myOWSC.offerings.length<1)
				throw DonaCadenaLang({"cat":"La capa '"+myOWSC.title+"' no t� cap 'offering'",
									"spa":"La capa '"+myOWSC.title+"' no tiene ning�n 'offering'",
									"eng":"The layer '"+myOWSC.title+"' do not have any offering",
									"fre":"La couche '"+myOWSC.title+"' n'a pas 'offering'"});

			//bBox= getWhere(myOWSC); By now, leave it visible in all CRS

			//A new layer is created with this myOWSC
			myLayer={ "ordre": 0,
				"servidor": myOWSC.offerings[0].server, //Server to which the request will be send
				"versio": DonaVersioDeCadena(myOWSC.offerings[0].version), //Version of the request
				"tipus": myOWSC.offerings[0].type, //The flag of the request type (WMS, WFS, ...)
				"nom": myOWSC.offerings[0].layerId,	//Layer id
				"desc": "Desc missing of OWSClayer "+myForm.elements[i].value, //Layer description
				"CRS": /*bBox ? new Array(bBox.CRS.name):*/null, //CRS array (Coordinate Reference System) where the layer is visible
				"FormatImatge": myOWSC.offerings[0].mime,  //Format visualitzaci� (image/gif, image/png, etc...)
				"transparencia": "transparent",
				"CostatMinim": ParamCtrl.zoom[zoom.length-1].costat, //Minimum acceptable pixel size in meters (defines minimum zoom level at which the layer is visible)
				"CostatMaxim": ParamCtrl.zoom[0].costat,  //Maximum acceptable pixel size in meters (defines maximum zoom level at which the layer is visible)
				"TileMatrixSet": myOWSC.offerings[0].tileMatrixSet ? new Array(myOWSC.offerings[0].tileMatrixSet):null,  //--TileMatrixSet
				"FormatConsulta": "text/xml",  //--format de les consultes per localitzaci�
				"separa": separator_set ? null:OWSCDocument.title, //Layer legend separator (like an overtitle for the layers)
				"DescLlegenda": myOWSC.title, //Title shown in the legend
				"i_estil": 0,
				"NColEstil": 0,
				"LlegDesplegada": false, 
				"VisibleALaLlegenda": true, 
				"visible": myOWSC.active ? "si":"ara_no",
				"consultable": "ara_no", 
				"descarregable": "no", 
				"i_data": 0, 
				"animable": false}; 

			//Add a tool tip to show on mouse over the layer name
			myLayer.toolTip= myOWSC.description;
			//Add the OWSC layer to the layer array
			newLayers.push(myLayer);
			//capa.unshift(myLayer); //Add it on top so it is viewed

			//Control if the separator has been already set (so it is not redrawn)
			if(!separator_set)
				separator_set= true;
		}
	
	//None layers will be added
	if(!myLayer)
		return;

	//Add the new layers on top of the capa Array
	//capa= newLayers.concat(capa); or newLayers.push(capa); do not work properly
	for(i=0;i<ParamCtrl.capa.length;i++)
		newLayers.push(ParamCtrl.capa[i]);
	ParamCtrl.capa= newLayers;
		
	//The map browser is redrawn in order the layers to appear
	CreaParamInternCtrlCapa();
	RevisaEstatsCapes();
	CreaLlegenda();
	RepintaMapesIVistes();

	//Try to center the view over a new point...
	bBox= getWhere(myOWSC);
	if(bBox)
	{
		var lowerLeft, upperRight, env;

		lowerLeft= bBox.lowerCorner.toMMPoint2D();
		upperRight= bBox.upperCorner.toMMPoint2D();

		//First of all the coordinates must be transformed to the current
		//coordinate reference system

		//TransformaCoordenadesPunt(lowerLeft, bBox.CRS.name, ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS)
		//TransformaCoordenadesPunt(upperRight, bBox.CRS.name, ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS);

		env= DonaEnvDeMinMaxXY(lowerLeft.x,upperRight.x,lowerLeft.y,upperRight.y);
		TransformaEnvolupant(env, bBox.CRS.name, ParamCtrl.ImatgeSituacio[ParamInternCtrl.ISituacio].EnvTotal.CRS);
		
		//A new envelope is produced from the Gml bounding box
		//And then go to that new envelope.
		PortamAAmbit(env);

		//alert("View movement: X: "+centralX+" Y: "+centralY);
		//PortamAPunt(centralX,centralY);

	}
}