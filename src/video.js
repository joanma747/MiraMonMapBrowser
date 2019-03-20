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

    Copyright 2001, 2018 Xavier Pons

    Aquest codi JavaScript ha estat realitzat per Joan Mas� Pau 
    (joan maso at uab cat) i Nuria Juli� (n julia at creaf uab cat)
    dins del grup del MiraMon. MiraMon �s un projecte del Centre
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

var RodetVertical=false;  // Constant. el mode vertical no s'ha provat mai.
var DatesVideo=[];  //{"i_capa":, "i_data":, "i_estil:, "milisegons":, "animable":("si", "ara_no", "no"), "carregada":, "carregadaRodet":, "timeoutRodet":, "timeoutFotograma":}
var IDataVideoMostrada;
var NomVideoActiu;
var PuntsSerieTemporal=[];

var timeoutVideoID=null, timeoutVideoInfo=null;

function OrdenacioCapesVideoData(x,y) 
{
	//Ascendent per data 
	return (x.milisegons - y.milisegons);
}

function EsCapaAptePerVideo(capa)
{
	if (capa.NomVideo!=null && DonaTipusServidorCapa(capa.tipus)=="TipusWMS" && 
		EsCapaDinsRangDEscalesVisibles(capa) && EsCapaDinsAmbitActual(capa) && EsCapaDisponibleEnElCRSActual(capa) &&
		capa.animable && capa.animable==true &&
		capa.data)
		return true;
	return false;
}

function DonaNPecesBarraVideo()
{
	return Math.round((ParamInternCtrl.vista.ncol-2)/8);
}

function DonaIPecaBarraVideo(i_data_video, n)
{
	if (document.video_animacions.TipusTemps[0].checked)
		return parseInt(((DatesVideo[i_data_video].milisegons-DatesVideo[0].milisegons)/(DatesVideo[DatesVideo.length-1].milisegons-DatesVideo[0].milisegons))*(n-1),10);
	return Math.round((n-1)*(i_data_video/(DatesVideo.length-1)));
}

function DonaIDataVideoDesDePecaBarraVideo(i, n)
{
	if (document.video_animacions.TipusTemps[0].checked)
	{
		t=((DatesVideo[DatesVideo.length-1].milisegons-DatesVideo[0].milisegons)/(n-1))*i+DatesVideo[0].milisegons;
		for (i_data_video=0; i_data_video<DatesVideo.length; i++)
			if (DatesVideo[i_data_video].milisegons<t)
				return i_data_video;
	}
	return Math.round((DatesVideo.length-1)*(i/(n-1)));
}

function DeterminaNombreComponentsSerieTemporal()
{
var n_c=0;
	for (var i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		if (DatesVideo[i_data_video].animable=="si" && 
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil &&
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component &&
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component.length>0)
		{
			if (n_c<ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component.length)
				n_c=ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component.length;
		}
	}
	return n_c;
}


function DonaDadesValorsSerieTemporalLocalitzacio(i_col,i_fil, filtra_null)
{
var data=[], v, i_c;
	
	var n_c=DeterminaNombreComponentsSerieTemporal();
	if (n_c==0)
		return null;
	for (i_c=0; i_c<n_c; i_c++)
		data[i_c]=[];

	for (var i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		if (DatesVideo[i_data_video].animable=="si" && 
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil &&
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component &&
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component.length>0)
		{
			v=DonaValorEstilComArrayDesDeValorsCapa(-4, DatesVideo[i_data_video].i_capa, DatesVideo[i_data_video].i_estil, DonaValorsDeDadesBinariesCapa(-4, ParamCtrl.capa[DatesVideo[i_data_video].i_capa], DatesVideo[i_data_video].i_data, i_col, i_fil));
			if (v==null)
			{
				if (!filtra_null)
					for (i_c=0; i_c<n_c; i_c++)
						data[i_c].push({t:DatesVideo[i_data_video].milisegons, y:""});
				continue;
			}
			
			for (i_c=0; i_c<v.length; i_c++)
				data[i_c].push({t:DatesVideo[i_data_video].milisegons, y:v[i_c]});
		}
	}
	return data;
}

function DonaDadesEstadistiquesSerieTemporalLocalitzacio()
{
var estadistics, estil;
var data=[], i_v, i_c;
	var n_c=DeterminaNombreComponentsSerieTemporal();
	if (n_c==0)
		return null;
	for (i_c=0; i_c<n_c; i_c++)
		data[i_c]=[[],[],[]];

	for (var i_data_video=0, i_v=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		if (DatesVideo[i_data_video].animable!="si" ||
			!ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil)
			continue;
		
		estil=ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil];
		
		if (estil.component)
		{
			for (i_c=0; i_c<estil.component.length; i_c++)
			{
				estadistics=CalculaEstadisticsHistograma(estil.capa_video[DatesVideo[i_data_video].i_data].histograma.component[i_c].classe, 
						DonaFactorValorMinEstiramentPaleta(estil.component[i_c]),
						DonaFactorValorMaxEstiramentPaleta(estil.component[i_c], 
								estil.capa_video[DatesVideo[i_data_video].i_data].histograma.component[i_c].classe.length  //El nombre de colors, o �s el nombre de colors de la paleta, o �s 256 per totes les bandes
									));
				data[i_c][0][i_v]={t:DatesVideo[i_data_video].milisegons, y:estadistics.mitjana+estadistics.desv_tipica};
				data[i_c][1][i_v]={t:DatesVideo[i_data_video].milisegons, y:estadistics.mitjana};
				data[i_c][2][i_v]={t:DatesVideo[i_data_video].milisegons, y:estadistics.mitjana-estadistics.desv_tipica};
			}
			i_v++;
		}
	}
	return data;
}

//Aquesta funci� dona les etiquetes de temps en mode "moment" tal com ho vol la llibreria chart.js.
function DonaEtiquetesValorsSerieTemporalLocalitzacio()
{
var labels=[];
	for (var i_data_video=0, i_v=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		if (DatesVideo[i_data_video].animable=="si" && 
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil &&
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component &&
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component.length>0)
		{
			labels[i_v]=moment(DatesVideo[i_data_video].milisegons);
			i_v++;
		}
	}
	return labels;
}

//Aquesta funci� dona les etiquetes de temps en mode text.
function DonaTempsValorsSerieTemporalLocalitzacio()
{
var temps=[];

	for (var i_data_video=0, i_v=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		if (DatesVideo[i_data_video].animable=="si" && 
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil &&
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component &&
			ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil].component.length>0)
		{
			temps[i_v]=DonaDataCapaComATextBreu(DatesVideo[i_data_video].i_capa, DatesVideo[i_data_video].i_data);
			i_v++;
		}
	}
	return temps;
}

function DonaTitolEixYSerieTemporalLocalitzacio()
{
var titol=[], estil;
	for (var i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		if (DatesVideo[i_data_video].animable!="si" ||
			!ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil)
			continue;
		
		estil=ParamCtrl.capa[DatesVideo[i_data_video].i_capa].estil[DatesVideo[i_data_video].i_estil];	
		if (estil.component)
		{
			for (var i_c=0; i_c<estil.component.length; i_c++)
				titol[i_c]=(estil.component[i_c].desc) ? DonaCadena(estil.component[i_c].desc) : DonaCadena(estil.desc);
			return titol;  //agafem el primer t�tol sense m�s.
		}
	}
}

var ChartConsultaSobreVideo=null;

function ConsultaSobreVideo(event_de_click)
{
	if (!EstanTotsElsFotogramesCarregatsVideo())
		return;

	var i=DonaCoordIDeCoordSobreVista(event_de_click.target.parentElement, -4, event_de_click.clientX)
	var j=DonaCoordJDeCoordSobreVista(event_de_click.target.parentElement, -4, event_de_click.clientY)

	var x=DonaCoordXDeCoordSobreVista(event_de_click.target.parentElement, -4, event_de_click.clientX);
	var y=DonaCoordYDeCoordSobreVista(event_de_click.target.parentElement, -4, event_de_click.clientY);

	var data=DonaDadesValorsSerieTemporalLocalitzacio(i, j, true);
	if (data==null)
		return;

	if (document.getElementById("video_grafic").style.visibility=="hidden")
	{
		//Ara cal presentar la gr�fica.
		ChartConsultaSobreVideo=ObreGraficSerieTemporal("video_grafic", "video_grafic", 
						DonaDadesEstadistiquesSerieTemporalLocalitzacio(), 								
						DonaEtiquetesValorsSerieTemporalLocalitzacio(), 								
						DonaTempsValorsSerieTemporalLocalitzacio(), 
						DonaTitolEixYSerieTemporalLocalitzacio());
	}
	AfegeixGraficSerieTemporal(ChartConsultaSobreVideo, data, DonaValorDeCoordActual(x, y, false, false));
	PuntsSerieTemporal.push({i:i,j:j,x:x,y:y});
}	

function OmpleFinestraVideo(win, name)
{
var cdns=[], capa, i_capa_primer_video;

	//Canviar la mida de la finestra.

		moveFinestraLayer(win, name, -1, -1, ParamInternCtrl.vista.ncol+142, ParamInternCtrl.vista.nfil+140);
							
	    //Determinar el primer video actiu.
		for (i_capa_primer_video=0; i_capa_primer_video<ParamCtrl.capa.length; i_capa_primer_video++)
		{
		 	if (EsCapaAptePerVideo(ParamCtrl.capa[i_capa_primer_video]))
			    break;
		}
		if (i_capa_primer_video==ParamCtrl.capa.length)
		{
			alert(DonaCadenaLang({"cat":"No hi ha cap capa disponible per al v�deo en aquesta �rea o zoom.", 
						"spa":"No hi ha ninguna capa disponible para el v�deo en este �rea o zoom.", 
						"eng":"There is no layer available for the video in this area or zoom.",
						"fre":"Il n'y a pas de couche disponible pour la vid�o dans cette zone ou le zoom"}));
			return;
		}

		//Comen�o pel selector de capes.
		cdns.push("<form name=\"video_animacions\" METHOD=\"GET\" onSubmit=\"return CanviaAnimacio(document.video_animacions.capa.value);\">",
			" <table border=\"0\" width=\"98%\" cellspacing=\"0\" cellpadding=\"0\"><tr><td align=left>"+DonaCadena(ParamCtrl.TitolCaixa)+"</td>",
				  "<td align=right><font face=\"Verdana, Arial, Helvetica, sans-serif\" size=2>",
				  DonaCadenaLang({"cat":"Animacions", "spa":"Animaciones", "eng":"Animations", "fre":"Animations"}),
				  ": <select name=\"capa\" onChange=\"CanviaAnimacio(document.video_animacions.capa.value);\">");

		var i_video=0;
		for (var i_capa_video_actiu=i_capa_primer_video; i_capa_video_actiu<ParamCtrl.capa.length; i_capa_video_actiu++)
		{
			capa=ParamCtrl.capa[i_capa_video_actiu];
		 	if (EsCapaAptePerVideo(capa))
			{
				cdns.push("<option value=\"",capa.NomVideo,"\"",((i_video==0) ? " selected" : ""),">" ,
						DonaCadena(capa.DescVideo),"</option>");
				i_video++; 
				//Salto la resta.
				for (var i_capa_video_actiu2=i_capa_video_actiu+1; true; i_capa_video_actiu2++)
				{
					if (i_capa_video_actiu2==ParamCtrl.capa.length ||
						(EsCapaAptePerVideo(ParamCtrl.capa[i_capa_video_actiu2]) && ParamCtrl.capa[i_capa_video_actiu2].NomVideo!=capa.NomVideo))
					{
						i_capa_video_actiu=i_capa_video_actiu2-1;
						break;
					}
				}
			}
		}
		cdns.push("</select>",
			"<span id=\"video_estil\"></span></font></td></tr></table>");
		
		//Creo la pantalla on es projecte el video.
		//Segurament aix� s'ha de canviar radicalment.
		cdns.push("<div id=\"video_central\" style=\"position: relative; margin-left: auto; margin-right: auto; width:"+ ParamInternCtrl.vista.ncol +"; height:"+ ParamInternCtrl.vista.nfil +";\">",
			"<div id=\"video_pantalla\" style=\"position: absolute; bottom: 0; width:"+ ParamInternCtrl.vista.ncol +"; height:"+ ParamInternCtrl.vista.nfil +";\"><img src=\"",AfegeixAdrecaBaseSRC("1gris.gif"),"\" NAME=\"pantalla\" width=\""+ ParamInternCtrl.vista.ncol +"\" height=\""+ ParamInternCtrl.vista.nfil +"\">",
			"</div>",
			"<div id=\"video_info\" class=\"text_allus\" style=\"position: absolute; top: 0; margin-left: auto; margin-right: auto; width:"+ ParamInternCtrl.vista.ncol +"; height:"+ ParamInternCtrl.vista.nfil +";\" onClick=\"ConsultaSobreVideo(event);\"></div>",
			"<div id=\"video_botons\" class=\"finestra_superposada text_allus\" style=\"position: absolute; bottom: 0; margin-left: auto; margin-right: auto;\" onClick=\"ConsultaSobreVideo(event);\">");

		//Dibuixar la data i la barra de progr�s del video.
		cdns.push("<center><font face=\"Verdana, Arial, Helvetica, sans-serif\" size=2>",
				  DonaCadenaLang({"cat":"Data", "spa":"Fecha", "eng":"Date","fre":"Date"}),": <span id=\"video_data\"></span><br>",
				"<img src=\"", AfegeixAdrecaBaseSRC("evol_mrg.png"), "\" border=\"0\">");
		var n=DonaNPecesBarraVideo();
		for (var i=0; i<n; i++)
			cdns.push("<img src=\"", AfegeixAdrecaBaseSRC("evol_bl.png"), "\" border=\"0\" name=\"video_evol",i,"\" onMouseOver=\"CanviaFotogramaSiPuntABarra(event,",i,");\">");		
		cdns.push("<img src=\"", AfegeixAdrecaBaseSRC("evol_mrg.png"), "\" border=\"0\"></center>");

		//Dibuixar els botons de progr�s del video.
		cdns.push("<center>",
			"<button onClick=\"return VideoMostraEvent(event, -2);\"><img align=middle src=\"",AfegeixAdrecaBaseSRC("b_start.gif"),"\" alt=\"",DonaCadenaLang({"cat":"al inici", "spa":"al inicio", "eng":"to the start", "fre":"au d�but"}),"\" title=\"",DonaCadenaLang({"cat":"al inici", "spa":"al inicio", "eng":"to the start", "fre":"au d�but"}),"\"></button>",
			"<button onClick=\"return VideoMostraEvent(event, -1);\"><img align=middle src=\"",AfegeixAdrecaBaseSRC("b_rewind.gif"),"\" alt=\"",DonaCadenaLang({"cat":"retrocedir un", "spa":"retroceder una", "eng":"step back", "fre":"revenir un"}),"\" title=\"",DonaCadenaLang({"cat":"retrocedir un", "spa":"retroceder una", "eng":"step back", "fre":"revenir un"}),"\"></button>",
			"<button onClick=\"return VideoMostraEvent(event, 0);\"><img align=middle src=\"",AfegeixAdrecaBaseSRC("b_pause.gif"),"\" alt=\"",DonaCadenaLang({"cat":"pausa", "spa":"pausa", "eng":"pause", "fre":"pause"}),"\" title=\"",DonaCadenaLang({"cat":"pausa", "spa":"pausa", "eng":"pause", "fre":"pause"}),"\"></button>",
			"<button onClick=\"return VideoPlayEvent(event, 9);\"><img align=middle src=\"",AfegeixAdrecaBaseSRC("b_play.gif"),"\" alt=\"",DonaCadenaLang({"cat":"reproduir", "spa":"reproducir", "eng":"play", "fre":"reproduire"}),"\" title=\"",DonaCadenaLang({"cat":"reproduir", "spa":"reproducir", "eng":"play", "fre":"reproduire"}),"\"></button>",
			"<button onClick=\"return VideoPlayEvent(event, 8);\"><img align=middle src=\"",AfegeixAdrecaBaseSRC("b_repeat.gif"),"\" alt=\"",DonaCadenaLang({"cat":"reproduir repetitivament", "spa":"reproducir repetit�vamente", "eng":"repeatedly play", "fre":"reproduire � plusieurs reprises"}),"\" title=\"",DonaCadenaLang({"cat":"reproduir repetitivament", "spa":"reproducir repetitivamente", "eng":"repeatedly play", "fre":"reproduire � plusieurs reprises"}),"\"></button>",
			"<button onClick=\"return VideoMostraEvent(event, 1);\"><img align=middle src=\"",AfegeixAdrecaBaseSRC("b_forward.gif"),"\" alt=\"",DonaCadenaLang({"cat":"avan�ar un", "spa":"avanzar una", "eng":"step forward", "fre":"avancer un"}),"\" title=\"",DonaCadenaLang({"cat":"avan�ar un", "spa":"avanzar una", "eng":"step forward", "fre":"avancer un"}),"\"></button>",
			"<button onClick=\"return VideoMostraEvent(event, 2);\"><img align=middle src=\"",AfegeixAdrecaBaseSRC("b_end.gif"),"\" alt=\"",DonaCadenaLang({"cat":"al final", "spa":"al final", "eng":"to the end", "fre":"� la fin"}),"\" title=\"",DonaCadenaLang({"cat":"al final", "spa":"al final", "eng":"to the end", "fre":"� la fin"}),"\"></button>",
			"<br />",
			"<font face=\"Verdana, Arial, Helvetica, sans-serif\" size=1>",
			"<input type=\"radio\" name=\"TipusTemps\">",
			DonaCadenaLang({"cat":"Escala temporal","spa":"Escala temporal","eng":"Temporal scale", "fre":"�chelle temporelle"}),
			" 1:<input type=\"text\" name=\"EscalaTemporal\" value=\"1000000\" size=8 onChange=\"document.video_animacions.TipusTemps[0].checked=true\">",
			"<input type=\"radio\" name=\"TipusTemps\" checked>",
			DonaCadenaLang({"cat":"Interval", "spa":"Intervalo", "eng":"Interval", "fre":"Intervalle"}),
			"<input name=\"interval\" type=\"text\" value=\"0.9\" size=\"3\" onChange=\"document.video_animacions.TipusTemps[1].checked=true\">s",
			"&nbsp;&nbsp;&nbsp;&nbsp;",
			"<a href='javascript:TancaFinestraLayer(\"video\");'>",
			DonaCadenaLang({"cat":"Tancar", "spa":"Cerrar", "eng":"Close", "fre":"Quitter"}),
			"</a>",
			"</font>",
			"</center>");
		cdns.push("</div>",
			"</div>");

		//if (RodetVertical==false)
		cdns.push("<div id=\"video_rodet\" style=\"overflow:auto;\"></div>",
			"<div id=\"video_grafic\" style=\"position: absolute; visibility: hidden; top: 25px; width:"+ 460 +"; height:"+ ParamInternCtrl.vista.nfil +";\"></div>",
			"</form>");
		
		contentFinestraLayer(win, name, cdns.join("")); 

	    	//Si hi ha un video actiu, activar la seva preparaci�.
		CanviaAnimacio(document.video_animacions.capa.value);
}

function CanviaEstatAnimable(boto, i_data_video)
{
	if (boto.checked)
	{
		if (!DatesVideo[i_data_video].carregada)
		{
			if (DatesVideo[i_data_video].timeOutFotograma)
				clearTimeout(DatesVideo[i_data_video].timeOutFotograma);
			var vista=JSON.parse(JSON.stringify(ParamInternCtrl.vista));
			vista.i_nova_vista=-4;
			DatesVideo[i_data_video].timeoutFotograma=setTimeout("CanviaImatgeCapaVideo("+i_data_video+", "+JSON.stringify(vista)+", "+DatesVideo[i_data_video].i_capa+", "+DatesVideo[i_data_video].i_estil+", "+DatesVideo[i_data_video].i_data+")", 50);
		}
		DatesVideo[i_data_video].animable="si";
	}
	else
		DatesVideo[i_data_video].animable="ara_no";
}

//Transforma un nom d'estil en un i_estil de la capa i_capa_video_actiu. Retorna null si no el troba
function DonaIEstilFotograma(i_capa_video_actiu, estil)
{
var capa=ParamCtrl.capa[i_capa_video_actiu];

	if (capa.estil && capa.estil.length>1 && estil)
	{
	        for (var i_estil=0; i_estil<capa.estil.length; i_estil++)
		{
		     	if (estil==((capa.estil[i_estil].nom) ? capa.estil[i_estil].nom : capa.estil[i_estil].desc))
				return i_estil;
		}
		return null;
	}
	return 0;
}

function CanviaImatgeCapaRodet(i_data_video, vista, i_capa, i_estil, i_data)
{
	var image=document.getElementById("rodet_i_raster"+i_data_video);
	CanviaImatgeCapa(image, vista, i_capa, i_estil, i_data, ActivaFotogramaRodet, i_data_video);
}

function CanviaImatgeCapaVideo(i_data_video, vista, i_capa, i_estil, i_data)
{
	var image=document.getElementById("video_i_raster"+i_data_video);
	CanviaImatgeCapa(image, vista, i_capa, i_estil, i_data, ActivaFotogramaVideo, i_data_video);
}

function CanviaVideo(nom_video, estil)
{
var img;
	//Faig un reset general de variables.
	AnullaTotsTimeOutVideo();

	var n=DonaNPecesBarraVideo();
	for (var i=0; i<n; i++)
	{
		img=document["video_evol"+i];
		img.src=AfegeixAdrecaBaseSRC("evol_bl.png");
	}

	CarregaDatesVideo(nom_video, estil);

	document.getElementById("video_info").innerHTML="<center><font face=\"Verdana, Arial, Helvetica, sans-serif\" size=\"3\">"+
		DonaCadenaLang({"cat":"Prem", "spa":"Presione", "eng":"Press", "fre":"Presse"})+
		": <input type=\"button\" class=\"Verdana11px\" value=\"--"+ 
		DonaCadenaLang({"cat":"Carregar", "spa":"Cargar", "eng":"Load", "fre":"Charge"})+
	        "--\" onClick='CarregaVideoRodetEvent(event, \""+nom_video+"\", \""+estil+"\");'>"+
		" (" + DatesVideo.length + " " + DonaCadenaLang({"cat":"fotogrames", "spa":"fotogramas", "eng":"frames", "fre":"cadres"}) +")"+
		"</font></center>";
}

function CarregaVideoRodetEvent(event, nom_video, estil)
{
	CarregaVideoRodet(nom_video, estil);
	dontPropagateEvent(event);
}

function CarregaDatesVideo(nom_video, estil)
{
var capa, i_estil

	//Determino quins fotogrames he de fer servir.
	for (var i_capa=0; i_capa<ParamCtrl.capa.length; i_capa++)
	{	
		capa=ParamCtrl.capa[i_capa];
		i_estil=DonaIEstilFotograma(i_capa, estil);
		if (EsCapaAptePerVideo(capa) &&
		    capa.NomVideo==nom_video &&
			i_estil!=null)
		{				
			for (var i_data=0; i_data<capa.data.length; i_data++)
			{
				var data=capa.data[i_data];
				var d=new Date(data.year ? data.year : 1970, data.month ? data.month-1 : 0, data.day ? data.day : 1, data.hour ? data.hour : 0, data.minute ? data.minute : 0, data.second ? data.second : 0);
				DatesVideo.push({"i_capa": i_capa, 
						"i_data": i_data, 
						"i_estil": i_estil, 
						"milisegons": d.getTime(), 
						"animable": ((capa.animable && capa.animable==true) ? "si" : "ara_no"),
						"carregada": false,
						"carregadaRodet": false});
			}
		}
	}
	DatesVideo.sort(OrdenacioCapesVideoData);
}

function DonaNColVideoRodet()
{
	if (RodetVertical)
		return 85;
	else
		return parseInt(DonaNFilVideoRodet()*ParamInternCtrl.vista.ncol/ParamInternCtrl.vista.nfil,10);
}

function DonaNFilVideoRodet()
{
	if (RodetVertical)
		return parseInt(DonaNColVideoRodet()*ParamInternCtrl.vista.nfil/ParamInternCtrl.vista.ncol,10);
	else
		return 50;
}

function DonaCadenaHTMLTitolFotogramaRodet(i_data_video)
{
var cdns=[];
	cdns.push("<font face=\"Verdana, Arial, Helvetica, sans-serif\" size=1><input ",
				((DatesVideo[i_data_video].animable=="si") ? "checked" : ""), " id=\"video_rodet_foto_ch",i_data_video,"\"",
				" type=\"checkbox\" onClick=\"CanviaEstatAnimable(this, ", i_data_video ,");\"><span id=\"video_rodet_foto_tx",i_data_video,"\" style=\"font-size:x-small;\">",
				DonaDataCapaComATextBreu(DatesVideo[i_data_video].i_capa, DatesVideo[i_data_video].i_data),"</span>");
	return cdns.join("");
}

function CarregaVideoRodet(nom_video, estil)
{
var i_data_video, capa, cdns=[];
var vista=JSON.parse(JSON.stringify(ParamInternCtrl.vista));
	
	document.getElementById("video_info").innerHTML="<center><font face=\"Verdana, Arial, Helvetica, sans-serif\" size=\"4\">"+ DonaCadenaLang({"cat":"Carregant rodet", "spa":"Cargando carrete", "eng":"Loading film", "fre":"Chargement film"}) + "; " + DonaCadenaLang({"cat":"espereu si us plau", "spa":"por favor, espere", "eng":"please wait", "fre":"s'il vous pla�t, attendez"})+"...</font></center>";

	//Dibuixo el rodet de fotogrames buit
	vista.i_nova_vista=-3;

	cdns.push("<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\'background-image: url(\"",AfegeixAdrecaBaseSRC("1film_v.png"),"\");background-repeat: repeat-x;\'>");
	vista.ncol=DonaNColVideoRodet();
	vista.nfil=DonaNFilVideoRodet();
	if (RodetVertical)
	{
		//Estil antic del rodet vertical a la esquerra.
		for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
		{
			cdns.push("<tr><td rowspan=\"4\" width=\"13\">&nbsp;</td>",
				"<td colspan=3>", 
				DonaCadenaHTMLTitolFotogramaRodet(i_data_video),
				"</td></tr>",
				"<tr><td colspan=3><img name=\"video_marc_sup",i_data_video,"\" src=\"",AfegeixAdrecaBaseSRC("1negre.gif"),"\" width=\"",vista.ncol+4,"\" height=\"2\"></td></tr>",
				"<tr><td><img name=\"video_marc_esq",i_data_video,"\" src=\"",AfegeixAdrecaBaseSRC("1negre.gif"),"\" width=\"2\" height=\"",vista.nfil,"\"></td>",
				"<td><div id=\"rodet_l_raster",i_data_video,"\" style=\"overflow:auto; width:", vista.ncol, "px; height:", vista.nfil, "px; background-color:white; \" onClick=\"MostraFotogramaAillat(", i_data_video,", false)\">",
				((ParamCtrl.capa[DatesVideo[i_data_video].i_capa].FormatImatge=="application/x-img") ? "<canvas id=\"rodet_i_raster"+i_data_video+"\" width=\""+vista.ncol+"\" height=\""+vista.nfil+"\"></canvas>" : "<img id=\"rodet_i_raster"+i_data_video+"\" name=\"rodet_i_raster"+i_data_video+"\" src=\""+AfegeixAdrecaBaseSRC("1tran.gif"/*DonaCadenaLang({"cat":"espereu.gif", "spa":"espereu_spa.gif", "eng":"espereu_eng.gif","fre":"espereu_fre.gif"})*/)+"\">"),
				"</div></td>",
				"<td><img name=\"video_marc_dre",i_data_video,"\" src=\"",AfegeixAdrecaBaseSRC("1negre.gif"),"\" width=\"2\" height=\"", vista.nfil,"\"></td></tr>",
				"<tr><td colspan=3><img name=\"video_marc_inf",i_data_video, "\" src=\"",AfegeixAdrecaBaseSRC("1negre.gif"),"\" width=\"",vista.ncol+4,"\" height=\"2\"></td></tr>");
		}
	}
	else
	{
		//Estil nou amb rodet horizontal a la part inferior.
		cdns.push("<tr>");
		for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
		{
			cdns.push("<td colspan=3>",
				DonaCadenaHTMLTitolFotogramaRodet(i_data_video),
				"</td>",
				"<td rowspan=\"6\"><img src=1tran.gif width=\"8\"></td>");
		}
		cdns.push("</tr><tr>");
		for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
			cdns.push("<td colspan=3><img src=1tran.gif height=\"13\"></td>");			
		cdns.push("</tr><tr>");
		for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
			cdns.push("<td colspan=3><img name=\"video_marc_sup",i_data_video,"\" src=\"",AfegeixAdrecaBaseSRC("1negre.gif"),"\" width=\"",vista.ncol+4,"\" height=\"2\"></td>");			
		cdns.push("</tr><tr>");
		for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
		{
			cdns.push("<td><img name=\"video_marc_esq",i_data_video,"\" src=\"",AfegeixAdrecaBaseSRC("1negre.gif"),"\" width=\"2\" height=\"",vista.nfil,"\"></td>",
				"<td><div id=\"rodet_l_raster",i_data_video,"\" style=\"overflow:auto; width:", vista.ncol, "px; height:", vista.nfil, "px; background-color:white;\" onClick=\"MostraFotogramaAillat(", i_data_video,", false)\">",
				((ParamCtrl.capa[DatesVideo[i_data_video].i_capa].FormatImatge=="application/x-img") ? "<canvas id=\"rodet_i_raster"+i_data_video+"\" width=\""+vista.ncol+"\" height=\""+vista.nfil+"\"></canvas>" : "<img id=\"rodet_i_raster"+i_data_video+"\" name=\"rodet_i_raster"+i_data_video+"\" src=\""+AfegeixAdrecaBaseSRC(DonaCadenaLang({"cat":"espereu.gif", "spa":"espereu_spa.gif", "eng":"espereu_eng.gif","fre":"espereu_fre.gif"}))+"\">"),
				"</div></td>",
				"<td><img name=\"video_marc_dre",i_data_video,"\" src=\"",AfegeixAdrecaBaseSRC("1negre.gif"),"\" width=\"2\" height=\"",vista.nfil,"\"></td>");
		}
		cdns.push("</tr><tr>");
		for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
			cdns.push("<td colspan=3><img name=\"video_marc_inf",i_data_video,"\" src=\"",AfegeixAdrecaBaseSRC("1negre.gif"),"\" width=\"",vista.ncol+4,"\" height=\"2\"></td>");
		cdns.push("</tr><tr>");
		for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
			cdns.push("<td colspan=3><img src=1tran.gif height=\"16\"></td>");
		cdns.push("<tr>");
	}
	cdns.push("</table>");
	var rodet=document.getElementById("video_rodet");
	rodet.innerHTML=cdns.join("");
	if (RodetVertical)
		rodet.scrollTop=0;
	else
		rodet.scrollLeft=0;

	//Demano totes les imatges petites per omplir el rodet de fotogrames
	for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		DatesVideo[i_data_video].timeOutRodet=setTimeout("CanviaImatgeCapaRodet("+i_data_video+", "+JSON.stringify(vista)+", "+DatesVideo[i_data_video].i_capa+", "+DatesVideo[i_data_video].i_estil+", "+DatesVideo[i_data_video].i_data+")", 75*i_data_video+75);
	}

	//Dibuixo tots els fotogrames de l'animaci� buits i apagats
	cdns.length=0;
	vista.ncol=ParamInternCtrl.vista.ncol;
	vista.nfil=ParamInternCtrl.vista.nfil;

	for (i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		//http://www.greywyvern.com/?post=337
		cdns.push("<div id=\"video_l_raster",i_data_video,"\" style=\"position: absolute; width:", vista.ncol, "px; height:", vista.nfil, "px; opacity:0;\" >",
			((ParamCtrl.capa[DatesVideo[i_data_video].i_capa].FormatImatge=="application/x-img") ? "<canvas id=\"video_i_raster"+i_data_video+"\" width=\""+vista.ncol+"\" height=\""+vista.nfil+"\"></canvas>" : "<img id=\"video_i_raster"+i_data_video+"\" name=\"video_i_raster"+i_data_video+"\" src=\""+AfegeixAdrecaBaseSRC(DonaCadenaLang({"cat":"espereu.gif", "spa":"espereu_spa.gif", "eng":"espereu_eng.gif","fre":"espereu_fre.gif"}))+"\">"),
			"</div>");
	}

	document.getElementById("video_pantalla").innerHTML=cdns.join("");

	NomVideoActiu=nom_video;
	if (timeoutVideoInfo)
	{
	    clearTimeout(timeoutVideoInfo);
	    timeoutVideoInfo=null;
	}	
	timeoutVideoInfo=setTimeout("ActualitzaNCarregatRodet()", 600);
}

function DonaRatioNodataRodet(i_data_video)
{
var capa=ParamCtrl.capa[DatesVideo[i_data_video].i_capa];	
	if (capa.FormatImatge=="application/x-img")
		return capa.estil[DatesVideo[i_data_video].i_estil].capa_rodet[DatesVideo[i_data_video].i_data].histograma.classe_nodata/(DonaNColVideoRodet()*DonaNFilVideoRodet());
	else
		return 0.0;
}

var RatioNodataNoTolerat=0.99;

function CanviaRatioNodataNoTolera(event, valor)
{
	var ratio_nodata_no_tolerat=valor/100;
	if (ratio_nodata_no_tolerat>0.99)
		ratio_nodata_no_tolerat=0.99;
	var n_foto=0;
	for (var i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		//Determino si la imatge �s enterament nodata.
		if (ratio_nodata_no_tolerat>DonaRatioNodataRodet(i_data_video))
			n_foto++;
	}
	document.getElementById("video_nodata_max_tx").innerHTML=valor + "% (" + n_foto + "/" + DatesVideo.length + " " + DonaCadenaLang({"cat":"fotogrames", "spa":"fotogramas", "eng":"frames", "fre":"cadres"}) +")";
}

function FiltraNodataICarregaVideo()
{
var ratio_nodata, inserir_slider=false;

	document.getElementById("video_info").innerHTML="<center><font face=\"Verdana, Arial, Helvetica, sans-serif\" size=\"4\">"+ DonaCadenaLang({"cat":"Carregant fotogrames", "spa":"Cargando fotogramas", "eng":"Loading frames", "fre":"Chargement des cadres"}) + "; " + DonaCadenaLang({"cat":"espereu si us plau", "spa":"por favor, espere", "eng":"please wait", "fre":"s'il vous pla�t, attendez"})+"...</font></center>";

	//Demano totes les imatges grans per omplir el video de fotogrames
	for (var i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		//Determino si la imatge �s enterament nodata.
		ratio_nodata=DonaRatioNodataRodet(i_data_video);
		if (0.99<ratio_nodata)
		{
			DatesVideo[i_data_video].animable="no";
			document.getElementById("video_rodet_foto_ch"+i_data_video).disabled=true;
			document.getElementById("video_rodet_foto_ch"+i_data_video).checked=false;
			document.getElementById("video_rodet_foto_tx"+i_data_video).style.textDecoration="line-through";
		}
		if (ratio_nodata>0.01)
			inserir_slider=true;
	}
	if (inserir_slider)
	{
		//codi que insereix un slider
		var initial_value=(RatioNodataNoTolerat>=0.99 ? 100 : RatioNodataNoTolerat*100);
		document.getElementById("video_info").innerHTML="<font face=\"Verdana, Arial, Helvetica, sans-serif\" size=\"3\">"+
			DonaCadenaLang({"cat":"Percentatge tolerat de superf�cie buida", "spa":"Porcentage tolerado de superficie vacia", "eng":"Allowed percentage of void space", "fre":"Pourcentage de surface vide tol�r�"})+
			": <input id=\"video_nodata_max_rg\" type=\"range\" step=\"0.1\" min=\"0\" max=\"100\" value=\""+ initial_value +"\" onchange=\"CanviaRatioNodataNoTolera(event, this.value);\" oninput=\"CanviaRatioNodataNoTolera(event, this.value);\" style=\"width: 300px\">"+
			" <span id=\"video_nodata_max_tx\"></span>"+
			" <input type=\"button\" class=\"Verdana11px\" value=\"--"+ 
			DonaCadenaLang({"cat":"Carregar", "spa":"Cargar", "eng":"Load", "fre":"Charge"})+
		        "--\" onClick='CarregaVideoEvent(event);'></font>";
		CanviaRatioNodataNoTolera(null, initial_value);
		return;
	}
	//Mostrar immediatament el v�deo
	CarregaVideo();
}

function CarregaVideoEvent(event)
{
	RatioNodataNoTolerat=document.getElementById("video_nodata_max_rg").value/100;
	if (RatioNodataNoTolerat>0.99)
		RatioNodataNoTolerat=0.99;

	CarregaVideo();
	dontPropagateEvent(event);
}


function CarregaVideo()
{
var vista=JSON.parse(JSON.stringify(ParamInternCtrl.vista));

	document.getElementById("video_info").innerHTML="<center><font face=\"Verdana, Arial, Helvetica, sans-serif\" size=\"4\">"+ DonaCadenaLang({"cat":"Carregant fotogrames", "spa":"Cargando fotogramas", "eng":"Loading frames", "fre":"Chargement des cadres"}) + "; " + DonaCadenaLang({"cat":"espereu si us plau", "spa":"por favor, espere", "eng":"please wait", "fre":"s'il vous pla�t, attendez"})+"...</font></center>";

	vista.i_nova_vista=-4; //Les imatges grans del video

	for (var i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		if (RatioNodataNoTolerat>DonaRatioNodataRodet(i_data_video))
			DatesVideo[i_data_video].timeoutFotograma=setTimeout("CanviaImatgeCapaVideo("+i_data_video+", "+JSON.stringify(vista)+", "+DatesVideo[i_data_video].i_capa+", "+DatesVideo[i_data_video].i_estil+", "+DatesVideo[i_data_video].i_data+")", 200*i_data_video+75);
		else
		{
			if (DatesVideo[i_data_video].animable!="no")
			{
				document.getElementById("video_rodet_foto_ch"+i_data_video).checked=false;
				DatesVideo[i_data_video].animable="ara_no";
			}
		}
	}
	if (timeoutVideoInfo)
	{
		clearTimeout(timeoutVideoInfo);
		timeoutVideoInfo=null;
	}	
	timeoutVideoInfo=setTimeout("ActualitzaNCarregatVideo()", 1000);
}//Fi de CanviaVideo()

function CanviaAnimacio(nom_video)
{
//Generar desplegable d'estils.
var capa, estils=[], cdns=[], i_estil;

		//Determino la llista d'estils.
		for (var i_capa_video_actiu=0;i_capa_video_actiu<ParamCtrl.capa.length; i_capa_video_actiu++)
		{
			if (EsCapaAptePerVideo(ParamCtrl.capa[i_capa_video_actiu]) && nom_video==ParamCtrl.capa[i_capa_video_actiu].NomVideo)
			{
				if (ParamCtrl.capa[i_capa_video_actiu].estil==null || ParamCtrl.capa[i_capa_video_actiu].estil.length==0)
				{
					for (i_estil=0; i_estil<estils.length; i_estil++)
					{
						if (estils[i_estil].nom=="")
							break;
					}
					if (i_estil==estils.length)
						estils[i_estil]={"nom":"", "desc": ""};
				}
				else
				{
					for (var i_estil_video_actiu=0; i_estil_video_actiu<ParamCtrl.capa[i_capa_video_actiu].estil.length; i_estil_video_actiu++)
					{				
						capa=ParamCtrl.capa[i_capa_video_actiu];
						for (i_estil=0; i_estil<estils.length; i_estil++)
						{
							if (!capa.estil[0].nom)
							{
								if (estils[i_estil].desc==capa.estil[i_estil_video_actiu].desc)
									break;
							}
							else
							{
								if (estils[i_estil].nom==capa.estil[i_estil_video_actiu].nom)
									break;
							}
						}
						if (i_estil==estils.length)
						{
							estils[i_estil]={"nom":capa.estil[i_estil_video_actiu].nom, "desc": capa.estil[i_estil_video_actiu].desc};
						}
					}
				}
			}
		}

		if (estils.length==0)
			cdns.push("");
		else if (estils.length==1)
			cdns.push(DonaCadena(estils[0].desc));
		else
		{
			cdns.push("<select name=\"estil\" onChange=\"CanviaVideo(document.video_animacions.capa.value, document.video_animacions.estil.value);\">");
			for (i_estil=0; i_estil<estils.length; i_estil++)
				cdns.push("<option value=\"",((estils[i_estil].nom) ? estils[i_estil].nom : DonaCadena(estils[i_estil].desc)),"\"",((i_estil==0) ? " SELECTED" : "") +">",DonaCadena(estils[i_estil].desc),"</option>");
			cdns.push("</select>");
		}
		document.getElementById("video_estil").innerHTML=cdns.join("");

		CanviaVideo(nom_video, (estils.length==0) ? null : ((estils[0].nom) ? estils[0].nom : estils[0].desc));
	return false;
}

function MostraFotogramaAillat(i_data_video, actualitza_scroll)
{
   	if (timeoutVideoID)
	{
        	clearTimeout(timeoutVideoID);
		timeoutVideoID=null;""
	}
	MostraFotograma(i_data_video, actualitza_scroll);
}

var ActualitzaNCarregatRodetEsCurs=false;

function ActualitzaNCarregatRodet()
{
var n_carregat=0;

	if (ActualitzaNCarregatRodetEsCurs)
	{
		timeoutVideoInfo=setTimeout("ActualitzaNCarregatRodet()", 50);
		return;
	}

	ActualitzaNCarregatRodetEsCurs=true;
	for (var i_data=0; i_data<DatesVideo.length; i_data++)
	{	
		if (DatesVideo[i_data].carregadaRodet)
			n_carregat++
	}
	if (n_carregat>=DatesVideo.length)
	{
		document.getElementById("video_info").innerHTML="";
		ActualitzaNCarregatRodetEsCurs=false;
		FiltraNodataICarregaVideo();
		return;
	}
	document.getElementById("video_info").innerHTML="<center><font face=\"Verdana, Arial, Helvetica, sans-serif\" size=\"4\">"+ DonaCadenaLang({"cat":"Carregant miniatures", "spa":"Cargando miniaturas", "eng":"Loading thumbnails", "fre":"Chargement des vignettes"}) + " " + n_carregat +"/"+ DatesVideo.length +" "+DonaCadenaLang({"cat":"Espereu si us plau", "spa":"Por favor, espere", "eng":"Please wait", "fre":"S'il vous pla�t, attendez"})+"...</font></center>";
	timeoutVideoInfo=setTimeout("ActualitzaNCarregatRodet()", 600);
	ActualitzaNCarregatRodetEsCurs=false;
}

function DonaNFotogramesCarregatsVideo()
{
var n_carregat=0;
	for (var i_data=0; i_data<DatesVideo.length; i_data++)
	{
		if (DatesVideo[i_data].carregada)
			n_carregat++
	}
	return n_carregat;
}

function DonaNFotogramesCarregablesVideo()
{
var n_carregable=0;
	for (var i_data=0; i_data<DatesVideo.length; i_data++)
	{
		if (DatesVideo[i_data].animable!="no" && RatioNodataNoTolerat>DonaRatioNodataRodet(i_data))
			n_carregable++
	}
	return n_carregable;
}


function EstanTotsElsFotogramesCarregatsVideo()
{
var n_carregat=DonaNFotogramesCarregatsVideo();
var n_carregable=DonaNFotogramesCarregablesVideo();
	if (n_carregat<n_carregable)
		return false;
	return true;
}

var ActualitzaNCarregatVideoEsCurs=false;

function ActualitzaNCarregatVideo()
{
var n_carregat, n_carregable;
	if (ActualitzaNCarregatVideoEsCurs)
	{
		timeoutVideoInfo=setTimeout("ActualitzaNCarregatVideo()", 50);
		return;
	}
	ActualitzaNCarregatVideoEsCurs=true;
	
	n_carregat=DonaNFotogramesCarregatsVideo();
	n_carregable=DonaNFotogramesCarregablesVideo();
	if (n_carregat>=n_carregable)
	{
		document.getElementById("video_info").innerHTML="";
		ActualitzaNCarregatVideoEsCurs=false;
		VideoPlay(8);  //Com que se que ja ho tinc tot, faig "Play" repetitiu.
		return;
	}
	document.getElementById("video_info").innerHTML="<center><font face=\"Verdana, Arial, Helvetica, sans-serif\" size=\"4\">"+ DonaCadenaLang({"cat":"Carregant", "spa":"Cargando", "eng":"Loading", "fre":"Chargement"}) + " " + n_carregat +"/"+ n_carregable +" "+DonaCadenaLang({"cat":"Espereu si us plau", "spa":"Por favor, espere", "eng":"Please wait", "fre":"S'il vous pla�t, attendez"})+"...</font></center>";
	timeoutVideoInfo=setTimeout("ActualitzaNCarregatVideo()", 1000);
	ActualitzaNCarregatVideoEsCurs=false;
}

function ActivaFotogramaRodet(i_data_video)
{
	DatesVideo[i_data_video].carregadaRodet=true;
}

function ActivaFotogramaVideo(i_data_video)
{
	DatesVideo[i_data_video].carregada=true;
	var img=document["video_evol"+DonaIPecaBarraVideo(i_data_video, DonaNPecesBarraVideo())];
	var nom_icona=TreuAdreca(img.src);

	//Posa la ratlleta vermella a la barra estreta
	if (nom_icona=="evol_bl.png")
		img.src=AfegeixAdrecaBaseSRC("evol_bl_fotog.png");
	else if (nom_icona=="evol_blau.png")
		img.src=AfegeixAdrecaBaseSRC("evol_blau_fotog.png");
	else if (nom_icona=="evol_pnt.png")
		img.src=AfegeixAdrecaBaseSRC("evol_pnt_fotog.png");
	else if (nom_icona=="evol_pnt_blau.png")
		img.src=AfegeixAdrecaBaseSRC("evol_pnt_blau_fotog.png");
}

function CanviaFotogramaSiPuntABarra(event, i)
{
var img=document["video_evol"+i];
var nom_icona=TreuAdreca(img.src);

	if (nom_icona!="evol_bl_fotog.png" && nom_icona!="evol_blau_fotog.png" &&
	    nom_icona!="evol_pnt_fotog.png" && nom_icona!="evol_pnt_blau_fotog.png")
		return;

	MostraFotogramaAillat(DonaIDataVideoDesDePecaBarraVideo(i, DonaNPecesBarraVideo()), true);
}

function MostraFotograma(i_data_video, actualitza_scroll)
{
var j, img, nom_icona;

	if (DatesVideo[i_data_video].animable!="si")
		return;

	//Actualitzo la data.
	document.getElementById("video_data").innerHTML=DonaDataComAText(DatesVideo[i_data_video].i_capa, DatesVideo[i_data_video].i_data);

	//Apago la barra de progr�s de videos.
	var n=DonaNPecesBarraVideo();

	//Encenc l'element de la barra que toca.
	var i=DonaIPecaBarraVideo(i_data_video, n);
	for (j=0; j<i; j++)
	{
		img=document["video_evol"+j];
		nom_icona=TreuAdreca(img.src);
		if (nom_icona=="evol_bl_fotog.png" || nom_icona=="evol_blau_fotog.png" || nom_icona=="evol_pnt_fotog.png" || nom_icona=="evol_pnt_blau_fotog.png")
			img.src=AfegeixAdrecaBaseSRC("evol_blau_fotog.png");
		else
			img.src=AfegeixAdrecaBaseSRC("evol_blau.png");

	}

	img=document["video_evol"+j];
	nom_icona=TreuAdreca(img.src);

	if (j==n-1)
	{
		if (nom_icona=="evol_bl_fotog.png" || nom_icona=="evol_blau_fotog.png" || nom_icona=="evol_pnt_blau_fotog.png")
			img.src=AfegeixAdrecaBaseSRC("evol_pnt_blau_fotog.png");
		else
			img.src=AfegeixAdrecaBaseSRC("evol_pnt_blau.png");
	}
	else
	{
		if (nom_icona=="evol_bl_fotog.png" || nom_icona=="evol_blau_fotog.png" || nom_icona=="evol_pnt_fotog.png")
			img.src=AfegeixAdrecaBaseSRC("evol_pnt_fotog.png");
		else
			img.src=AfegeixAdrecaBaseSRC("evol_pnt.png");
		for (j++; j<n; j++)
		{
			img=document["video_evol"+j];
			nom_icona=TreuAdreca(img.src);
			if (nom_icona=="evol_bl_fotog.png" || nom_icona=="evol_blau_fotog.png" || nom_icona=="evol_pnt_fotog.png" || nom_icona=="evol_pnt_blau_fotog.png")
				img.src=AfegeixAdrecaBaseSRC("evol_bl_fotog.png");
			else
				img.src=AfegeixAdrecaBaseSRC("evol_bl.png");
		}
	}

	//Actualitzo la posici� del rodet i el fotograma actiu
	var n=parseFloat(document.video_animacions.interval.value);
	if (n<=0 || isNaN(n) || n<0.09)
		n=0;
			if (IDataVideoMostrada!=-1)
			{
				document["video_marc_sup"+IDataVideoMostrada].src=AfegeixAdrecaBaseSRC("1negre.gif");
				document["video_marc_dre"+IDataVideoMostrada].src=AfegeixAdrecaBaseSRC("1negre.gif");
				document["video_marc_esq"+IDataVideoMostrada].src=AfegeixAdrecaBaseSRC("1negre.gif");
				document["video_marc_inf"+IDataVideoMostrada].src=AfegeixAdrecaBaseSRC("1negre.gif");
				//Desactivo els fotograma que no toca en el video
				document.getElementById("video_l_raster"+IDataVideoMostrada).style.opacity=0;
				//Determino la corba adient amb: http://cubic-bezier.com
				document.getElementById("video_l_raster"+IDataVideoMostrada).style.transition=(n) ? "opacity "+n/2+"s cubic-bezier(.6,.2,.8,.4)" : null;
			}
			document["video_marc_sup"+i_data_video].src=AfegeixAdrecaBaseSRC("1vermell.gif");
			document["video_marc_dre"+i_data_video].src=AfegeixAdrecaBaseSRC("1vermell.gif");
			document["video_marc_esq"+i_data_video].src=AfegeixAdrecaBaseSRC("1vermell.gif");
			document["video_marc_inf"+i_data_video].src=AfegeixAdrecaBaseSRC("1vermell.gif");
			//Activo els fotograma que no toca en el video.
			document.getElementById("video_l_raster"+i_data_video).style.opacity=1;
			document.getElementById("video_l_raster"+i_data_video).style.transition=(n) ? "opacity "+n/2+"s cubic-bezier(.2,.6,.4,.8)":null;

	var i_actual;
	if (actualitza_scroll)
	{
		var rodet;
		rodet=document.getElementById("video_rodet");
		if (rodet)
		{
			if (RodetVertical)
			{
				i_actual=i_data_video;
				if (i_actual>0)
				    i_actual--;
				rodet.scrollTop=i_actual*rodet.scrollHeight/DatesVideo.length;
			}
			else
			{
				var ncol=parseInt(50*ParamInternCtrl.vista.ncol/ParamInternCtrl.vista.nfil)+8+2+2; //Mida d'un fotograma del rodet amb tots els marges
				var n_fotog_rodet_visibles=(ParamInternCtrl.vista.ncol+142)/ncol;
				i_actual=parseInt(i_data_video/n_fotog_rodet_visibles)*n_fotog_rodet_visibles;
				rodet.scrollLeft=i_actual*rodet.scrollWidth/DatesVideo.length;
			}
		}
	}
	IDataVideoMostrada=i_data_video;
}

function DeterminaIDataVideoSeguent(i_data_mostrada, opcio)
{
var i_data_a_mostrar=i_data_mostrada;
var i_data_video_actiu;

		if (i_data_mostrada==-1)
		{
			for(var i=0; i<DatesVideo.length; i++)
			{
				if(DatesVideo[i].animable=="si")
					return i;
			}
		}
		else
		{
			for (i_data_video_actiu=0; i_data_video_actiu<DatesVideo.length; i_data_video_actiu++)
			{	
				if (i_data_video_actiu!=i_data_mostrada && 
					DatesVideo[i_data_video_actiu].animable=="si")
				{			 	    				
					if (opcio==1)
					{
						if (DatesVideo[i_data_mostrada].milisegons < DatesVideo[i_data_video_actiu].milisegons)
						{
							if (i_data_a_mostrar==i_data_mostrada)
								i_data_a_mostrar=i_data_video_actiu;
							else if (DatesVideo[i_data_a_mostrar].milisegons > DatesVideo[i_data_video_actiu].milisegons)
								i_data_a_mostrar=i_data_video_actiu; 
						}
					}
					else
					{
						if (DatesVideo[i_data_mostrada].milisegons > DatesVideo[i_data_video_actiu].milisegons)
						{
							if (i_data_a_mostrar==i_data_mostrada)
								i_data_a_mostrar=i_data_video_actiu;
							else if (DatesVideo[i_data_a_mostrar].milisegons < DatesVideo[i_data_video_actiu].milisegons)
								i_data_a_mostrar=i_data_video_actiu; 
						}
					}
				}
			}
		}
	return i_data_a_mostrar;
}

function VideoPlayEvent(event, opcio)
{
	VideoPlay(opcio);
	dontPropagateEvent(event);
	return false;
}

function VideoPlay(opcio)
{
	if (timeoutVideoID)
	{
	    clearTimeout(timeoutVideoID);
	    timeoutVideoID=null;
	}
	VideoPlayRecursiva(opcio);
	return false;
}

function VideoPlayRecursiva(opcio)
{
var i_data_a_mostrar;
var i_capa_previa;
var n;

	if (document.video_animacions.TipusTemps[0].checked)
	{
		n=parseFloat(document.video_animacions.EscalaTemporal.value);
		if (n<=0)
			alert(DonaCadenaLang({"cat":"Valor incorrecte de l'escala temporal.", 
		   			"spa":"Valor incorrecto de la escala temporal.", 
					"eng":"Wrong value in temporal scale.", 
					"fre":"Valeur incorrect de l'�chelle temporelle"}));
		else
		{
			if (0==VideoMostra(opcio)) 	   //mostrar la imatge que toca.
			{
				//buscar la imatge seg�ent.
				i_data_a_mostrar=DeterminaIDataVideoSeguent(IDataVideoMostrada, 1)
				if (IDataVideoMostrada==i_data_a_mostrar)
				{
					if (opcio==9)
						return; //Estic al final d'una sequencia autom�tica.

					//animaci� circular
					i_data_a_mostrar=0;
					while (DatesVideo[i_data_a_mostrar].animable!="si")
					{
						i_capa_previa=i_data_a_mostrar;
						i_data_a_mostrar=DeterminaIDataVideoSeguent(i_capa_previa, 1);
						if (i_capa_previa==i_data_a_mostrar)
						return;  //alguna cosa no va
					}
				}
				timeoutVideoID=setTimeout('VideoPlayRecursiva('+opcio+')', (DatesVideo[i_data_a_mostrar].milisegons-DatesVideo[IDataVideoMostrada].milisegons)/n);
			}		   		   		   
		}
	}
	else if (document.video_animacions.TipusTemps[1].checked)
	{
		n=parseFloat(document.video_animacions.interval.value);
		if (n<=0 || isNaN(n))
		{
			alert(DonaCadenaLang({"cat":"Valor incorrecte de l'interval de segons. Usar� 5.0",
					"spa": "Valor incorrecto del intervaluo de segundos. Usar� 5.0",
					"eng": "Incorrect value of the interval of seconds. I'll use 5.0",
					"fre": "Valeur incorrecte de l'intervalle de secondes. Je vais utiliser 5.0"}));
			n=5.0;
		}
		if (0==VideoMostra(opcio))
			timeoutVideoID=setTimeout("VideoPlayRecursiva("+opcio+")", n*1000);
	}
	else
		alert(DonaCadenaLang({"cat":"Sel�lecciona escala temporal o interval",
					"spa": "Seleccione escala temporal o intervalo",
					"eng": "Select temporal scale or interval",
					"fre": "S�lectionner �chelle temporelle o� intervalle"}));
}//Fi de VideoPlayRecursiva()

function VideoMostraEvent(event, opcio)
{
	VideoMostra(opcio);
	dontPropagateEvent(event);
	return false;
}

function VideoMostra(opcio)
{
var i_data_a_mostrar=IDataVideoMostrada;
var i_capa_previa;

  
	if (opcio!=8 && opcio!=9)
	{
   		if (timeoutVideoID)
		{
			clearTimeout(timeoutVideoID);
			timeoutVideoID=null;
		}
	}
	if (opcio==1 || opcio==8 || opcio==9)
	{
		i_data_a_mostrar=DeterminaIDataVideoSeguent(IDataVideoMostrada, 1);
		if ((opcio==8 || opcio==9) && IDataVideoMostrada==i_data_a_mostrar)
		{
		    //Estic al final d'una sequencia autom�tica.
			if (opcio==9)
				return 1;

			//animaci� circular
		 	i_data_a_mostrar=0;
			while (DatesVideo[i_data_a_mostrar].animable!="si")
			{
				i_capa_previa=i_data_a_mostrar;
				i_data_a_mostrar=DeterminaIDataVideoSeguent(i_capa_previa, 1);
				if (i_capa_previa==i_data_a_mostrar)
				return;  //alguna cosa no va
			}			
 		}
	}
	else if (opcio==-1)
	{
		i_data_a_mostrar=DeterminaIDataVideoSeguent(IDataVideoMostrada, -1);
	}
	else if (opcio==2)
	{
		i_data_a_mostrar=DatesVideo.length-1;    
		while (DatesVideo[i_data_a_mostrar].animable!="si")
		{
			i_capa_previa=i_data_a_mostrar;
			i_data_a_mostrar=DeterminaIDataVideoSeguent(i_capa_previa, -1);
			if (i_capa_previa==i_data_a_mostrar)
			return;  //alguna cosa no va
		}
	}
	else if (opcio==-2)
	{
		i_data_a_mostrar=0;
		while (DatesVideo[i_data_a_mostrar].animable!="si")
		{
			i_capa_previa=i_data_a_mostrar;
			i_data_a_mostrar=DeterminaIDataVideoSeguent(i_capa_previa, 1);
			if (i_capa_previa==i_data_a_mostrar)
			return;  //alguna cosa no va
		}
	}
	
	/*else  //(opcio==0)*/
	MostraFotograma(i_data_a_mostrar, true);
	return 0;
}

function AnullaTotsTimeOutVideo()
{
	if (timeoutVideoID)
	{
	    clearTimeout(timeoutVideoID);
	    timeoutVideoID=null;
	}	
	if (timeoutVideoInfo)
	{
	    clearTimeout(timeoutVideoInfo);
	    timeoutVideoInfo=null;
	}
	for (var i_data_video=0; i_data_video<DatesVideo.length; i_data_video++)
	{
		if (DatesVideo[i_data_video].timeOutRodet)
		{
			clearTimeout(DatesVideo[i_data_video].timeOutRodet);
			DatesVideo[i_data_video].timeOutRodet=null
		}
		if (DatesVideo[i_data_video].timeOutFotograma)
		{
			clearTimeout(DatesVideo[i_data_video].timeOutFotograma);
			DatesVideo[i_data_video].timeOutFotograma=null
		}
	}
	DatesVideo=[];
	IDataVideoMostrada=-1;
	PuntsSerieTemporal=[];
	TancaFinestraSerieTemp("video_grafic");
}

//No useu sola. Useu TancaFinestraLayer("video")
function TancaFinestra_video()
{
	AnullaTotsTimeOutVideo();
}
