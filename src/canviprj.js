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

var FactorGrausARadiants=0.0174532925199432957692369076848   //M_PI/180
var FactorRadiantsAGraus=57.295779513082320876798154814105   //180/M_PI
var FactorGrausAMetres=111319.5

function g_gms(graus_totals, zeros)
{
var cdns= [];
var graus_no_signe=Math.abs(graus_totals);
	
	if (graus_totals<0)
		cdns.push("-");
	var minuts=(graus_no_signe-floor_DJ(graus_no_signe))*60;
	var segons=(minuts-floor_DJ(minuts))*60;
	if (segons<0.00001)
		segons=0;
	if (zeros)
		cdns.push(floor_DJ(graus_no_signe),"� ",floor_DJ(minuts),"\' ",OKStrOfNe(segons,ParamCtrl.NDecimalsCoordXY),"\"");
	else
	{
		if (floor_DJ(graus_no_signe)!=0)
			cdns.push(floor_DJ(graus_no_signe),"� ");
		if (floor_DJ(minuts)!=0)
			cdns.push(floor_DJ(minuts),"\' ");
		if (segons!=0);
			cdns.push(OKStrOfNe(segons,ParamCtrl.NDecimalsCoordXY)+"\"");
	}
	return cdns.join("");
}

function DonaDenominadorDeLEscalaArrodonit(a)
{
	if (a<1e-20)
		return a;
	var e=Math.floor(Math.log(a)/Math.LN10);    //dona l'exponent en base 10
        if (e<2)
		return a;
	e-=2;
	var n=Math.abs(a/Math.pow(10,e));
	
	//Ara cal arrodinir a l'enter m�s proper:
	if (n<112)
		n=100;
	else if (n<137)
		n=125;
	else if (n<165)
		n=150;
	else if (n<187)
		n=175;
	else if (n<212)
		n=200;
	else if (n<275)
		n=250;
	else if (n<325)
		n=300;
	else if (n<375)
		n=350;
	else if (n<450)
		n=400;
	else if (n<550)
		n=500;
	else if (n<675)
		n=600;
	else if (n<775)
		n=750;
	else if (n<900)
		n=800;
	else
		n=1000;
	return n*Math.pow(10,e);
}

function sign(x)
{
	if (x < 0.0)
		return -1;
	else
		return 1;
}

var CanviCRS={"darrerCRS": "",
		"offset_mapa_X": 0.0, 
		"offset_mapa_Y": 0.0, 
		"lambda_0": 0.0,
		"fi_0": 0.0,
		"fi_1": 0.0,
		"fi_2": 0.0,
		"c_tissot": 0.0,
		"radi_a": 0.0,
		"radi_b": 0.0,
		"u_sobre_f": 0.0,
		"e2": 0.0,
		"e4": 0.0,
		"e6": 0.0,
		"e8": 0.0,
		"ep2": 0.0,
		"e1": 0.0,
		"e1_sobre2": 0.0,
		"e1_sobre3": 0.0,
		"e1_sobre4": 0.0,
		"e": 0.0,
		"m0": 0.0,
		"m1": 0.0,
		"t1": 0.0,
		"m2": 0.0,
		"t2": 0.0,
		"n": 0.0,
		"F": 0.0,
		"t0": 0.0,
		"ro_0": 0.0,
		"ap": 0.0,
		"bp": 0.0,
		"A": 0.0,
		"B_sobre_2": 0.0,
		"C_sobre_4": 0.0,
		"D_sobre_6": 0.0,

		"_2_sobre_ap_bp": 0.0,
		"ap_1_menys_e2": 0.0,
		"_1_sobre_a2_b2": 0.0,
		"Ap": 0.0,
		"Bp": 0.0,
		"Cp": 0.0,
		"Dp": 0.0,
		"a_NUM_PI": 0.0,
		"a_factor_fi1": 0.0,
		"mapa_Y_max": 0.0
	};

var M_PI_2=Math.PI/2;
var M_PI_4=Math.PI/4


function LambertConformal_Funcio_14_15_Snyder(e2, fi)
{
var retorn;

	var sin_fi=Math.sin(fi);
	retorn=(Math.cos(fi)/Math.sqrt(1.0-e2*sin_fi*sin_fi));
	return retorn;
}

function LambertConformal_Funcio_15_9a_Snyder(e, fi)
{
var retorn;
	var sin_fi=Math.sin(fi);
	if (sin_fi>-1.0+0.00001)
		retorn=Math.sqrt(((1.0-sin_fi)/(1.0+sin_fi))*Math.pow((1.0+e*sin_fi)/(1.0-e*sin_fi), e));
	else
		retorn=0;  //-MAXDOUBLE;
	return retorn;
}


//Aquesta funci� no cal cridar-la. La criden les de canvi de projecci� directament si cal
function InicialitzaCRS(crs)
{
var crs_up=crs.toUpperCase();

  if (crs_up=="EPSG:32628")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=-15*FactorGrausARadiants;  //fus 28
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:23029" || crs_up=="EPSG:25829" || crs_up=="EPSG:32629")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=-9*FactorGrausARadiants;  //fus 29
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:23030" || crs_up=="EPSG:25830" || crs_up=="EPSG:32630")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=-3*FactorGrausARadiants;  //fus 30
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:23031" || crs_up=="EPSG:25831" || crs_up=="EPSG:32631")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=3*FactorGrausARadiants;  //fus 31
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:23032" || crs_up=="EPSG:25832" || crs_up=="EPSG:32632")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=9*FactorGrausARadiants;  //fus 32
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:23033" || crs_up=="EPSG:25833" || crs_up=="EPSG:32633")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=15*FactorGrausARadiants;  //fus 33
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:23034" || crs_up=="EPSG:25834" || crs_up=="EPSG:32634")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=21*FactorGrausARadiants;  //fus 34
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:23035" || crs_up=="EPSG:25835" || crs_up=="EPSG:32635")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=27*FactorGrausARadiants;  //fus 35
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:23036" || crs_up=="EPSG:25836" || crs_up=="EPSG:32636")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=0;    //hemisferi N
    CanviCRS.lambda_0=33*FactorGrausARadiants;  //fus 36
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:32736")
  {
    CanviCRS.offset_mapa_X=500000;
    CanviCRS.offset_mapa_Y=10000000;    //hemisferi S
    CanviCRS.lambda_0=33*FactorGrausARadiants;  //fus 36
    CanviCRS.fi_0=0*FactorGrausARadiants;
    CanviCRS.c_tissot=0.9996;
  }
  else if (crs_up=="EPSG:27572")
  {
    CanviCRS.offset_mapa_X=600000;  //Zona IIext
    CanviCRS.offset_mapa_Y=2200000;
    CanviCRS.lambda_0=2.33722917*FactorGrausARadiants;
    CanviCRS.fi_0=46.80000000*FactorGrausARadiants;
    CanviCRS.fi_1=45.89891889*FactorGrausARadiants;
    CanviCRS.fi_2=47.69601444*FactorGrausARadiants;
  }
  else if (crs_up=="EPSG:27563")
  {
    CanviCRS.offset_mapa_X=600000;  //Zona III
    CanviCRS.offset_mapa_Y=200000;
    CanviCRS.lambda_0=2.33722917*FactorGrausARadiants;
    CanviCRS.fi_0=44.10000000*FactorGrausARadiants;
    CanviCRS.fi_1=43.19929139*FactorGrausARadiants;
    CanviCRS.fi_2=44.99609389*FactorGrausARadiants;
  }
  else if (crs_up=="EPSG:27573")
  {
    CanviCRS.offset_mapa_X=600000;  //Zona IIIext
    CanviCRS.offset_mapa_Y=3200000;
    CanviCRS.lambda_0=2.33722917*FactorGrausARadiants;
    CanviCRS.fi_0=44.10000000*FactorGrausARadiants;
    CanviCRS.fi_1=43.19929139*FactorGrausARadiants;
    CanviCRS.fi_2=44.99609389*FactorGrausARadiants;
  }
  else if (crs_up=="AUTO2:LCC,1,14.5,38,35,41")
  {
    CanviCRS.offset_mapa_X=0;  
    CanviCRS.offset_mapa_Y=0;
    CanviCRS.lambda_0=14.5*FactorGrausARadiants;
    CanviCRS.fi_0=38*FactorGrausARadiants;
    CanviCRS.fi_1=35*FactorGrausARadiants;
    CanviCRS.fi_2=41*FactorGrausARadiants;
  }
  else if (crs_up=="AUTO2:MERCATOR,1,0,41.42" || crs_up=="AUTO2:MERCATOR_WGS84,1,0,41.42")
  {
    CanviCRS.offset_mapa_X=0;
    CanviCRS.offset_mapa_Y=0;
    CanviCRS.lambda_0=0.0;
    CanviCRS.fi_1=41.416666666667*FactorGrausARadiants;
  }
  else if (crs_up=="AUTO2:MERCATOR,1,0,40.60")
  {
    CanviCRS.offset_mapa_X=0;
    CanviCRS.offset_mapa_Y=0;
    CanviCRS.lambda_0=0.0;
    CanviCRS.fi_1=40.60*FactorGrausARadiants;
  }
  else if (crs_up=="AUTO2:MERCATOR,1,0,0.0" || crs_up=="EPSG:3395" || crs_up=="EPSG:3785" || crs_up=="EPSG:3857")
  {
    CanviCRS.offset_mapa_X=0;
    CanviCRS.offset_mapa_Y=0;
    CanviCRS.lambda_0=0.0;
    CanviCRS.fi_1=0*FactorGrausARadiants;
  }
  
	if (crs_up=="EPSG:23029" || crs_up=="EPSG:23030" || crs_up=="EPSG:23031")
	{
		CanviCRS.radi_a=6378388.0;
		CanviCRS.u_sobre_f=297.0;
	}
	else
	{
		CanviCRS.radi_a=6378137.0;
		CanviCRS.u_sobre_f=298.257223563;
	}
    CanviCRS.radi_b=((CanviCRS.u_sobre_f)?((CanviCRS.radi_a)-(CanviCRS.radi_a)/(CanviCRS.u_sobre_f)):CanviCRS.radi_a);
    CanviCRS.e2=(CanviCRS.radi_a*CanviCRS.radi_a - CanviCRS.radi_b*CanviCRS.radi_b)/(CanviCRS.radi_a*CanviCRS.radi_a);
    CanviCRS.e4=CanviCRS.e2*CanviCRS.e2;
    CanviCRS.e6=CanviCRS.e4*CanviCRS.e2;
    CanviCRS.e8=CanviCRS.e4*CanviCRS.e4;
    CanviCRS.ep2=CanviCRS.e2/(1-CanviCRS.e2);

    CanviCRS.e1=(1.0-Math.sqrt(1.0-CanviCRS.e2))/(1.0+Math.sqrt(1.0-CanviCRS.e2));
    CanviCRS.e1_sobre2=CanviCRS.e1*CanviCRS.e1;
    CanviCRS.e1_sobre3=CanviCRS.e1_sobre2*CanviCRS.e1;
    CanviCRS.e1_sobre4=CanviCRS.e1_sobre2*CanviCRS.e1_sobre2;

    if (crs_up=="EPSG:32628" || crs_up=="EPSG:32629" || crs_up=="EPSG:32630" || crs_up=="EPSG:32631" || crs_up=="EPSG:32632" || crs_up=="EPSG:32633" || crs_up=="EPSG:32634" || crs_up=="EPSG:32635" || crs_up=="EPSG:32636" ||
		crs_up=="EPSG:25829" || crs_up=="EPSG:25830" || crs_up=="EPSG:25831" || crs_up=="EPSG:25832" || crs_up=="EPSG:25833" || crs_up=="EPSG:25834" || crs_up=="EPSG:25835" || crs_up=="EPSG:25836" ||
        crs_up=="EPSG:23029" || crs_up=="EPSG:23030" || crs_up=="EPSG:23031" || crs_up=="EPSG:23032" || crs_up=="EPSG:23033" || crs_up=="EPSG:23034" || crs_up=="EPSG:23035" || crs_up=="EPSG:23036" ||
        crs_up=="EPSG:32736")
    {
        CanviCRS.m0=CanviCRS.radi_a*((1.0-CanviCRS.e2/4.0-3.0*CanviCRS.e4/64.0-5.0*CanviCRS.e6/256.0)*(CanviCRS.fi_0)-((3.0*CanviCRS.e2/8.0+3.0*CanviCRS.e4/32.0+45.0*CanviCRS.e6/1024.0)*Math.sin(2.0*CanviCRS.fi_0)) +
    		(15.0*CanviCRS.e4/256.0+45.0*CanviCRS.e6/1024.0)*Math.sin(4.0*CanviCRS.fi_0)-((35.0*CanviCRS.e6/3072.0)*Math.sin(6.0*CanviCRS.fi_0)));
		CanviCRS.ap = CanviCRS.radi_a*CanviCRS.c_tissot;
		CanviCRS.bp = CanviCRS.radi_b*CanviCRS.c_tissot;

		CanviCRS.A = 1 + CanviCRS.e2*3/4 + CanviCRS.e2*CanviCRS.e2*45/64 + Math.pow(CanviCRS.e2,3)*175/256 + Math.pow(CanviCRS.e2,4)*11025/16384 + Math.pow(CanviCRS.e2,5)*43659/65536;
		CanviCRS.B_sobre_2 = (CanviCRS.e2*3/4 + CanviCRS.e2*CanviCRS.e2*15/16 + Math.pow(CanviCRS.e2,3)*525/512 + Math.pow(CanviCRS.e2,4)*2205/2048 + Math.pow(CanviCRS.e2,5)*72765/65536) / 2;
		CanviCRS.C_sobre_4 = (CanviCRS.e2*CanviCRS.e2*15/64 + Math.pow(CanviCRS.e2,3)*105/256 + Math.pow(CanviCRS.e2,4)*2205/4096 + Math.pow(CanviCRS.e2,5)*10395/16384) / 4;
		CanviCRS.D_sobre_6 = (Math.pow(CanviCRS.e2,3)*35/512 + Math.pow(CanviCRS.e2,4)*315/2048 + Math.pow(CanviCRS.e2,5)*31185/131072) / 6;

		CanviCRS._2_sobre_ap_bp=2 / (CanviCRS.ap+CanviCRS.bp);  //No sembla servir per res?
		CanviCRS.ap_1_menys_e2=CanviCRS.ap*(1-CanviCRS.e2);
		CanviCRS._1_sobre_a2_b2=1 / (CanviCRS.radi_a*CanviCRS.radi_a+CanviCRS.radi_b*CanviCRS.radi_b);  //No sembla servir per res?

		CanviCRS.mapa_Y_max=(CanviCRS.ap+CanviCRS.bp)*Math.PI/4-1300;
    }
    else if (crs_up=="EPSG:27563" || crs_up=="EPSG:27572" || crs_up=="EPSG:27573" || crs_up=="AUTO2:LCC,1,14.5,38,35,41")
    {
		CanviCRS.e=Math.sqrt(CanviCRS.e2);
        CanviCRS.m1=LambertConformal_Funcio_14_15_Snyder(CanviCRS.e2, CanviCRS.fi_1);
        CanviCRS.t1=LambertConformal_Funcio_15_9a_Snyder(CanviCRS.e, CanviCRS.fi_1);
        if (CanviCRS.fi_1==CanviCRS.fi_2)
            CanviCRS.n=Math.sin(CanviCRS.fi_1);
        else
        {
            CanviCRS.m2=LambertConformal_Funcio_14_15_Snyder(CanviCRS.e2, CanviCRS.fi_2);
            CanviCRS.t2=LambertConformal_Funcio_15_9a_Snyder(CanviCRS.e, CanviCRS.fi_2);
            CanviCRS.n=(log(CanviCRS.m1)-log(CanviCRS.m2))/(log(CanviCRS.t1)-log(CanviCRS.t2));
        }
        CanviCRS.F=CanviCRS.m1/(CanviCRS.n*Math.pow(CanviCRS.t1,CanviCRS.n));
        CanviCRS.t0=LambertConformal_Funcio_15_9a_Snyder(CanviCRS.e, CanviCRS.fi_0);
        CanviCRS.ro_0=CanviCRS.radi_a*CanviCRS.F*Math.pow(CanviCRS.t0, CanviCRS.n);
    }
    else if (crs_up=="AUTO2:MERCATOR,1,0,41.42" || 
		crs_up=="AUTO2:MERCATOR_WGS84,1,0,41.42" || 
		crs_up=="AUTO2:MERCATOR,1,0,40.60" || 
		crs_up=="AUTO2:MERCATOR,1,0,0.0" ||
		crs_up=="EPSG:3395")
    {
		CanviCRS.e=Math.sqrt(CanviCRS.e2);
        CanviCRS.a_NUM_PI=CanviCRS.radi_a*Math.PI;

        CanviCRS.a_factor_fi1=CanviCRS.radi_a*Math.cos(CanviCRS.fi_1)/Math.sqrt((1-CanviCRS.e2*Math.sin(CanviCRS.fi_1)*Math.sin(CanviCRS.fi_1)));

        var CC=7.0*CanviCRS.e6/120.0+81.0*CanviCRS.e8/1120.0;
        var DD=4279.0*CanviCRS.e8/161280.0;
        CanviCRS.Ap=(CanviCRS.e2/2.0+5.0*CanviCRS.e4/24.0+CanviCRS.e6/12.0+13.0*CanviCRS.e8/360.0) - CC;
        CanviCRS.Bp=2.0*(7.0*CanviCRS.e4/48.0+29.0*CanviCRS.e6/240.0+811.0*CanviCRS.e8/11520.0)-4.0*DD;
        CanviCRS.Cp=4.0*CC;
        CanviCRS.Dp=8.0*DD;
    }
    else if (crs_up=="EPSG:3785" || crs_up=="EPSG:3857")
    {
        CanviCRS.a_factor_fi1=CanviCRS.radi_a*Math.cos(CanviCRS.fi_1);
    }
    CanviCRS.darrerCRS=crs_up;
}

//var ll_x, ll_y;  //coordenades LongLat de sortida de les funcions de canvi de projecci�.
//var crs_x, crs_y;  //coordenades XY de sortida de les funcions de canvi de projecci�.

function UTM_Geo(x,y)
{
var ll_x, ll_y;
    x-=CanviCRS.offset_mapa_X;
    y-=CanviCRS.offset_mapa_Y;

    var mu=(CanviCRS.m0+y/CanviCRS.c_tissot)/(CanviCRS.radi_a*(1.0-CanviCRS.e2/4.0-3.0*CanviCRS.e4/64.0-5.0*CanviCRS.e6/256.0));
    //fi1 �s 'footpoint latitude o latitud del meridi� central que t� la mateixa y que el punt (lont, lat)
    var fi1=mu+(3.0*CanviCRS.e1/2.0-27.0*CanviCRS.e1_sobre3/32.0)*Math.sin(2.0*mu)+(21.0*CanviCRS.e1_sobre2/16.0-55.0*CanviCRS.e1_sobre4/32.0)*Math.sin(4.0*mu)+(151.0*CanviCRS.e1_sobre3/96.0)*Math.sin(6.0*mu)+(1097.0*CanviCRS.e1_sobre4/512.0)*Math.sin(8.0*mu);
    if (fi1<Math.PI/2-0.00001 && fi1>-Math.PI/2+0.00001)
    {
        var R1=CanviCRS.radi_a*(1.0-CanviCRS.e2)/Math.pow(1.0-CanviCRS.e2*Math.sin(fi1)*Math.sin(fi1), 1.5);
		var e2_sin2_lat=CanviCRS.e2*Math.sin(fi1)*Math.sin(fi1);
		var N1;
		
		if (e2_sin2_lat+0.00001<1.0)
		    N1=CanviCRS.radi_a/Math.sqrt(1.0-e2_sin2_lat);
        else
    	    N1=CanviCRS.radi_a;
			
		var D;		
        if (N1-0.00001>0.0)
	    	D=x/(N1*CanviCRS.c_tissot);
        else
            D=x;

        var T1=Math.tan(fi1)*Math.tan(fi1);   //vigilar les singularitats de tan
        var C1=CanviCRS.ep2*Math.cos(fi1)*Math.cos(fi1);

        ll_y=fi1-(N1*Math.tan(fi1)/R1)*(D*D/2.0-((5.0+3.0*T1+10.0*C1-4.0*C1*C1-9.0*CanviCRS.ep2)*D*D*D*D/24.0)+
        	(61.0+90.0*T1+298.0*C1+45.0*T1*T1-252.0*CanviCRS.ep2-3.0*C1*C1)*D*D*D*D*D*D/720.0);

        ll_x=CanviCRS.lambda_0+(D-(1.0+2*T1+C1)*D*D*D/6.0+(5.0-2.0*C1+28.0*T1-3.0*C1+8.0*CanviCRS.ep2+24.0*T1*T1)*D*D*D*D*D/120.0)/Math.cos(fi1);
    }
    else
    {
        ll_x=CanviCRS.lambda_0;   //indeterminat per� podem donar CanviCRS.lambda_0
        if (x>0.0)
    		ll_y=Math.PI/2;
        else
    		ll_y=-Math.PI/2;
    }
  //ll_x*=FactorRadiantsAGraus;
  //ll_y*=FactorRadiantsAGraus;
  return {"x": ll_x*FactorRadiantsAGraus, "y": ll_y*FactorRadiantsAGraus};
}

function Geo_UTM(ll_x,ll_y)
{
var N, I1, I2, I3, I4, I5;
var llr_x=ll_x*FactorGrausARadiants;
var llr_y=ll_y*FactorGrausARadiants;
var p=llr_x-CanviCRS.lambda_0, crs_x, crs_y;

	if (llr_y<=-M_PI_2)
	{
		crs_x=CanviCRS.offset_mapa_X;
		crs_y=-CanviCRS.mapa_Y_max;
	}
	else if (llr_y>=M_PI_2)
	{
		crs_x=CanviCRS.offset_mapa_X;
		crs_y=CanviCRS.mapa_Y_max;
	}
	else
	{
			N = CanviCRS.ap / Math.sqrt (1-CanviCRS.e2*Math.sin(llr_y)*Math.sin(llr_y));

			I1 = CanviCRS.ap_1_menys_e2*(CanviCRS.A*llr_y-CanviCRS.B_sobre_2*Math.sin(2*llr_y) + CanviCRS.C_sobre_4*Math.sin(4*llr_y) - CanviCRS.D_sobre_6*Math.sin(6*llr_y));
			I2 = (N*Math.pow(Math.cos(llr_y),2)*Math.tan(llr_y))/2;
			I3 = (N*Math.pow(Math.cos(llr_y),4)*Math.tan(llr_y)*(5-Math.pow(Math.tan(llr_y),2) + 9*CanviCRS.ep2*Math.cos(llr_y)*Math.cos(llr_y) + 4*CanviCRS.ep2*CanviCRS.ep2*Math.pow(Math.cos(llr_y),4)))/24;
			I4 = N*Math.cos(llr_y);
			I5 = (N*Math.pow(Math.cos(llr_y),3)*(1 - Math.pow(Math.tan(llr_y),2) + CanviCRS.ep2*Math.pow(Math.cos(llr_y), 2)))/6;

			crs_x = CanviCRS.offset_mapa_X + p*I4 + p*p*p*I5;
			crs_y = I1+ p*p*I2+ p*p*p*p*I3;
	}
	crs_y += CanviCRS.offset_mapa_Y;
	
	return {"x": crs_x, "y": crs_y};
}


function LambertConicaConforme_Geo(x,y)
{
var ll_x, ll_y;

  x-=CanviCRS.offset_mapa_X;
  y-=CanviCRS.offset_mapa_Y;
  var ro0_mapaY=(CanviCRS.ro_0 - y);
    var t=Math.pow(sign(CanviCRS.n)*Math.sqrt(x*x+ro0_mapaY*ro0_mapaY)/(CanviCRS.radi_a*CanviCRS.F), 1.0/CanviCRS.n);
    var psi=M_PI_2-2.0*Math.atan(t);
    ll_x=atan2(x, ro0_mapaY)/CanviCRS.n+CanviCRS.lambda_0;
    ll_y=psi + (CanviCRS.e2/2.0 + 5.0*CanviCRS.e4/24.0 + CanviCRS.e6/12.0 + 13.0*CanviCRS.e8/360.0) * Math.sin(2.0*psi) +
           ( 7.0*CanviCRS.e4/48.0 + 29.0*CanviCRS.e6/240.0 + 811.0*CanviCRS.e8/11520.0) * Math.sin(4.0*psi) +
           ( 7.0*CanviCRS.e6/120.0 + 81.0*CanviCRS.e8/1120.0) * Math.sin(6.0*psi) +
		   (4279.0*CanviCRS.e8/161280.0) *Math.sin(8.0*psi);
  //ll_x*=FactorRadiantsAGraus;
  //ll_y*=FactorRadiantsAGraus;
  return {"x": ll_x*FactorRadiantsAGraus, "y": ll_y*FactorRadiantsAGraus};
}

function Geo_LambertConicaConforme(ll_x,ll_y)
{
var crs_x, crs_y;
var llr_x=ll_x*FactorGrausARadiants;
var llr_y=ll_y*FactorGrausARadiants;

    var t;
    if ( (CanviCRS.n>0 && llr_y<-M_PI_4+PI/16) ||  (CanviCRS.n<0 && llr_y>M_PI_4-PI/16))
    	t=LambertConformal_Funcio_15_9a_Snyder(CanviCRS.e, (-M_PI_4+PI/16)*sign(CanviCRS.n));
    else
		t=LambertConformal_Funcio_15_9a_Snyder(CanviCRS.e, llr_y);
    var ro=CanviCRS.radi_a*CanviCRS.F*Math.pow(t,CanviCRS.n);
    var theta=CanviCRS.n*(llr_x-CanviCRS.lambda_0);
    crs_x=ro*Math.sin(theta)+CanviCRS.offset_mapa_X;
    crs_y=CanviCRS.ro_0 - ro*Math.cos(theta)+CanviCRS.offset_mapa_Y;
  return {"x": crs_x, "y": crs_y};

}

function Mercator_esferica_Geo(x,y)
{
var ll_x, ll_y;
  ll_x=CanviCRS.lambda_0 + (x-CanviCRS.offset_mapa_X)/CanviCRS.a_factor_fi1;
	ll_y=Math.atan(sinh((y-CanviCRS.offset_mapa_Y)/CanviCRS.a_factor_fi1));
  //ll_x*=FactorRadiantsAGraus;
  //ll_y*=FactorRadiantsAGraus;
  return {"x": ll_x*FactorRadiantsAGraus, "y": ll_y*FactorRadiantsAGraus};
}

function Geo_Mercator_esferica(ll_x,ll_y)
{
var crs_x, crs_y;
var llr_x=ll_x*FactorGrausARadiants;
var llr_y=ll_y*FactorGrausARadiants;

  crs_x=CanviCRS.a_factor_fi1*(llr_x-CanviCRS.lambda_0)+CanviCRS.offset_mapa_X;

    var sin_lat=Math.sin(llr_y);
    if (sin_lat>=0.999999)
    	crs_y=CanviCRS.a_NUM_PI;
    else if (sin_lat<=-0.999999)
    	crs_y=-CanviCRS.a_NUM_PI;
    else
		crs_y=CanviCRS.a_factor_fi1/2*log((1+sin_lat)/(1-sin_lat))+CanviCRS.offset_mapa_Y;

    if (crs_y>CanviCRS.a_NUM_PI)
		crs_y=CanviCRS.a_NUM_PI;
    else if (crs_y<-CanviCRS.a_NUM_PI)
		crs_y=-CanviCRS.a_NUM_PI;
	return {"x": crs_x, "y": crs_y};
}

function Mercator_Geo(x,y)
{
var ll_x, ll_y;

	ll_x=CanviCRS.lambda_0 + (x-CanviCRS.offset_mapa_X)/CanviCRS.a_factor_fi1;
	var psi=M_PI_2-2.0*Math.atan(exp(-(y-CanviCRS.offset_mapa_Y)/CanviCRS.a_factor_fi1));
	var cos_2_psi=Math.cos(2.0*psi);
	ll_y=psi+Math.sin(2.0*psi)*(CanviCRS.Ap+cos_2_psi*(CanviCRS.Bp+cos_2_psi*(CanviCRS.Cp+CanviCRS.Dp*cos_2_psi)));
	//ll_x*=FactorRadiantsAGraus;
	//ll_y*=FactorRadiantsAGraus;
	return {"x": ll_x*FactorRadiantsAGraus, "y": ll_y*FactorRadiantsAGraus};
}

function Geo_Mercator(ll_x,ll_y)
{
var crs_x, crs_y;

var llr_x=ll_x*FactorGrausARadiants;
var llr_y=ll_y*FactorGrausARadiants;

  crs_x=CanviCRS.a_factor_fi1*(llr_x-CanviCRS.lambda_0)+CanviCRS.offset_mapa_X;
    var e_sin_lat=CanviCRS.e*Math.sin(llr_y);
    if (abs(llr_y-M_PI_2)<0.00001)
    	crs_y=CanviCRS.a_NUM_PI;
    else if (llr_y+M_PI_2<0.00001)
		crs_y=CanviCRS.a_NUM_PI;
    else if (abs(e_sin_lat+1.0)<0.00001)
    	crs_y=CanviCRS.a_NUM_PI;
    else
    {
    	var r=Math.tan(M_PI_4+ llr_y/2.0)*Math.pow((1.0-e_sin_lat)/(1.0+e_sin_lat), (CanviCRS.e/2.0));
        if (r<0.00001)
            crs_y=-CanviCRS.a_NUM_PI;
        else
		{
            crs_y=CanviCRS.a_factor_fi1*log(r)+CanviCRS.offset_mapa_Y;
            if (crs_y>CanviCRS.a_NUM_PI)
                crs_y=CanviCRS.a_NUM_PI;
            else if (crs_y<-CanviCRS.a_NUM_PI)
				crs_y=-CanviCRS.a_NUM_PI;
    	}
    }
	return {"x": crs_x, "y": crs_y};
}


var CantaNoImplemCoordLongLat=true;

function DonaCoordenadesLongLat(x,y,crs)
{
var crs_up;

	if (CanviCRS.darrerCRS!=crs.toUpperCase())
		InicialitzaCRS(crs);

	crs_up=crs.toUpperCase();

	if (crs_up=="EPSG:32628" || crs_up=="EPSG:32629" || crs_up=="EPSG:32630" || crs_up=="EPSG:32631" || crs_up=="EPSG:32632" || crs_up=="EPSG:32633" || crs_up=="EPSG:32634" || crs_up=="EPSG:32635" || crs_up=="EPSG:32636" ||
		crs_up=="EPSG:25829" || crs_up=="EPSG:25830" || crs_up=="EPSG:25831" || crs_up=="EPSG:25832" || crs_up=="EPSG:25833" || crs_up=="EPSG:25834" || crs_up=="EPSG:25835" || crs_up=="EPSG:25836" ||
        	crs_up=="EPSG:23029" || crs_up=="EPSG:23030" || crs_up=="EPSG:23031" || crs_up=="EPSG:23032" || crs_up=="EPSG:23033" || crs_up=="EPSG:23034" || crs_up=="EPSG:23035" || crs_up=="EPSG:23036" ||
	        crs_up=="EPSG:32736")
        	return UTM_Geo(x,y);
	if (crs_up=="EPSG:27563" || crs_up=="EPSG:27572" || crs_up=="EPSG:27573" || crs_up=="AUTO2:LCC,1,14.5,38,35,41")
		return LambertConicaConforme_Geo(x,y);
	if (crs_up=="AUTO2:MERCATOR,1,0,41.42" || crs_up=="AUTO2:MERCATOR,1,0,40.60" || crs_up=="AUTO2:MERCATOR,1,0,0.0" ||
		     crs_up=="AUTO2:MERCATOR_WGS84,1,0,41.42" || crs_up=="EPSG:3395")
		return Mercator_Geo(x,y);
	if (crs_up=="EPSG:3785" || crs_up=="EPSG:3857")
		return Mercator_esferica_Geo(x,y);
	if (EsProjLongLat(crs_up))
	{
		return {"x": x, "y": y};
	}
	if (CantaNoImplemCoordLongLat)
	{
		alert(DonaCadenaLang({"cat":"Pas a longitud/latitud no implementat per aquest sistema de refer�ncia", 
								  "spa":"Paso a longitud/latitud no implementado para este sistema de referencia",
								  "eng":"Longitude/latitude conversion has not been implemented in this reference system",
								  "fre":"Conversion � longitude/latitude pas impl�ment� pour ce syst�me de r�f�rence"})+" (CRS/SRS=" + crs +").");
		CantaNoImplemCoordLongLat=false;
	}
	return {"x": 0.0, "y": 0.0};
}

function DonaCoordenadesCRS(ll_x,ll_y,crs)
{
var crs_up;

	if (CanviCRS.darrerCRS!=crs.toUpperCase())
		InicialitzaCRS(crs);

	crs_up=crs.toUpperCase();
	if (crs_up=="EPSG:32628" || crs_up=="EPSG:32629" || crs_up=="EPSG:32630" || crs_up=="EPSG:32631" || crs_up=="EPSG:32632" || crs_up=="EPSG:32633" || crs_up=="EPSG:32634" || crs_up=="EPSG:32635" || crs_up=="EPSG:32636" ||
		crs_up=="EPSG:25829" || crs_up=="EPSG:25830" || crs_up=="EPSG:25831" || crs_up=="EPSG:25832" || crs_up=="EPSG:25833" || crs_up=="EPSG:25834" || crs_up=="EPSG:25835" || crs_up=="EPSG:25836" ||
        	crs_up=="EPSG:23029" || crs_up=="EPSG:23030" || crs_up=="EPSG:23031" || crs_up=="EPSG:23032" || crs_up=="EPSG:23033" || crs_up=="EPSG:23034" || crs_up=="EPSG:23035" || crs_up=="EPSG:23036" ||
	        crs_up=="EPSG:32736")
        	return Geo_UTM(ll_x,ll_y);
	if (crs_up=="EPSG:27563" || crs_up=="EPSG:27572" || crs_up=="EPSG:27573" || crs_up=="AUTO2:LCC,1,14.5,38,35,41")
		return Geo_LambertConicaConforme(ll_x,ll_y);		
	if (crs_up=="AUTO2:MERCATOR,1,0,41.42" || crs_up=="AUTO2:MERCATOR,1,0,40.60" || crs_up=="AUTO2:MERCATOR,1,0,0.0" ||
	     crs_up=="AUTO2:MERCATOR_WGS84,1,0,41.42" || crs_up=="EPSG:3395")
		return Geo_Mercator(ll_x,ll_y);
	if (crs_up=="EPSG:3785" || crs_up=="EPSG:3857")
		return Geo_Mercator_esferica(ll_x,ll_y);
	if (EsProjLongLat(crs_up))
	{
		//crs_x=ll_x;
		//crs_y=ll_y;
		return {"x": ll_x, "y": ll_y};
	}
	alert(DonaCadenaLang({"cat":"Pas a coordenades mapa no implementat per aquest sistema de refer�ncia", 
							  "spa":"Paso a coordenades mapa no implementado para este sistema de referencia", 
							  "eng":"Map coordinates conversion has not been implemented in this reference system",
							  "fre":"Conversion � coordonn�es de la carte pas impl�ment� pour ce syst�me de r�f�rence."})+" (CRS/SRS=" + crs +").");
	return {"x": 0.0, "y": 0.0};
}

function DonaEnvolupantLongLat(env, crs)
{
var ll, env_ll={"MinX": 0, "MaxX": 0, "MinY": 0, "MaxY": 0};

    ll=DonaCoordenadesLongLat(env.MinX, env.MinY, crs);
    env_ll.MinX=env_ll.MaxX=ll.x;
    env_ll.MinY=env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX, env.MinY+(env.MaxY-env.MinY)/4, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX, env.MinY+(env.MaxY-env.MinY)/2, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX, env.MinY+(env.MaxY-env.MinY)*3/4, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX, env.MaxY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX+(env.MaxX-env.MinX)/4, env.MaxY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX+(env.MaxX-env.MinX)/2, env.MaxY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX+(env.MaxX-env.MinX)*3/4, env.MaxY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MaxX, env.MaxY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MaxX, env.MinY+(env.MaxY-env.MinY)*3/4, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MaxX, env.MinY+(env.MaxY-env.MinY)/2, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MaxX, env.MinY+(env.MaxY-env.MinY)/4, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MaxX, env.MinY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX+(env.MaxX-env.MinX)*3/4, env.MinY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX+(env.MaxX-env.MinX)/2, env.MinY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    ll=DonaCoordenadesLongLat(env.MinX+(env.MaxX-env.MinX)/4, env.MinY, crs);
    if (env_ll.MinX>ll.x) env_ll.MinX=ll.x;
    else if (env_ll.MaxX<ll.x) env_ll.MaxX=ll.x;
    if (env_ll.MinY>ll.y) env_ll.MinY=ll.y;
    else if (env_ll.MaxY<ll.y) env_ll.MaxY=ll.y;

    return env_ll;
}

function DonaEnvolupantCRS(env,crs)
{
var crs_xy;
var env_crs_xy={"MinX": 0, "MaxX": 0, "MinY": 0, "MaxY": 0};

    crs_xy=DonaCoordenadesCRS(env.MinX, env.MinY, crs);
    env_crs_xy.MinX=env_crs_xy.MaxX=crs_xy.x;
    env_crs_xy.MinY=env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX, env.MinY+(env.MaxY-env.MinY)/4, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX, env.MinY+(env.MaxY-env.MinY)/2, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX, env.MinY+(env.MaxY-env.MinY)*3/4, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX, env.MaxY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX+(env.MaxX-env.MinX)/4, env.MaxY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX+(env.MaxX-env.MinX)/2, env.MaxY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX+(env.MaxX-env.MinX)*3/4, env.MaxY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MaxX, env.MaxY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MaxX, env.MinY+(env.MaxY-env.MinY)*3/4, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MaxX, env.MinY+(env.MaxY-env.MinY)/2, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MaxX, env.MinY+(env.MaxY-env.MinY)/4, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MaxX, env.MinY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX+(env.MaxX-env.MinX)*3/4, env.MinY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX+(env.MaxX-env.MinX)/2, env.MinY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    crs_xy=DonaCoordenadesCRS(env.MinX+(env.MaxX-env.MinX)/4, env.MinY, crs);
    if (env_crs_xy.MinX>crs_xy.x) env_crs_xy.MinX=crs_xy.x;
    else if (env_crs_xy.MaxX<crs_xy.x) env_crs_xy.MaxX=crs_xy.x;
    if (env_crs_xy.MinY>crs_xy.y) env_crs_xy.MinY=crs_xy.y;
    else if (env_crs_xy.MaxY<crs_xy.y) env_crs_xy.MaxY=crs_xy.y;

    return env_crs_xy;
}

function EsProjLongLat(crs)
{
	if (DonaUnitatsCoordenadesProj(crs)=="�")
		return true;
	return false;
}

function DonaUnitatsCoordenadesProj(crs)
{
var crs_up=crs.toUpperCase();

	if (crs_up=="EPSG:32628" || crs_up=="EPSG:32629" || crs_up=="EPSG:32630" || crs_up=="EPSG:32631" || crs_up=="EPSG:32632" || crs_up=="EPSG:32633" || crs_up=="EPSG:32634" || crs_up=="EPSG:32635" || crs_up=="EPSG:32636" ||
		crs_up=="EPSG:25829" || crs_up=="EPSG:25830" || crs_up=="EPSG:25831" || crs_up=="EPSG:25832" || crs_up=="EPSG:25833" || crs_up=="EPSG:25834" || crs_up=="EPSG:25835" || crs_up=="EPSG:25836" ||
	        crs_up=="EPSG:23029" || crs_up=="EPSG:23030" || crs_up=="EPSG:23031" || crs_up=="EPSG:23032" || crs_up=="EPSG:23033" || crs_up=="EPSG:23034" || crs_up=="EPSG:23035" || crs_up=="EPSG:23036" ||
        	crs_up=="EPSG:32736" ||
		crs_up=="EPSG:27563" || crs_up=="EPSG:27572" || crs_up=="EPSG:27573" || crs_up=="AUTO2:LCC,1,14.5,38,35,41" || crs_up=="AUTO2:MERCATOR,1,0,41.42" || 
		crs_up=="AUTO2:MERCATOR,1,0,40.60" || crs_up=="AUTO2:MERCATOR,1,0,0.0" ||
		crs_up=="AUTO2:MERCATOR_WGS84,1,0,41.42" || crs_up=="EPSG:3395" || crs_up=="EPSG:3785" || crs_up=="EPSG:3857")
        	return "m";
	else if (crs_up=="EPSG:4326" || crs_up=="EPSG:4258" || crs_up=="CRS:84")
		return "�";
	else
		return "m?";
}

function DonaDescripcioCRS(crs)
{
var crs_up=crs.toUpperCase();

	if (crs_up=="EPSG:32628")
		return "UTM28N - WGS84";
	else if (crs_up=="EPSG:32629")
		return "UTM29N - WGS84";
	else if (crs_up=="EPSG:32630")
		return "UTM30N - WGS84";
	else if (crs_up=="EPSG:32631")
		return "UTM31N - WGS84";
    	else if (crs_up=="EPSG:32632")
		return "UTM32N - WGS84";
    	else if (crs_up=="EPSG:32633")
		return "UTM33N - WGS84";
	else if (crs_up=="EPSG:32634")
		return "UTM34N - WGS84";
	else if (crs_up=="EPSG:32635")
		return "UTM35N - WGS84";
	else if (crs_up=="EPSG:32636")
		return "UTM36N - WGS84";
	else if (crs_up=="EPSG:25829")
		return "UTM29N - ETRS89";
	else if (crs_up=="EPSG:25830")
		return "UTM30N - ETRS89";
	else if (crs_up=="EPSG:25831")
		return "UTM31N - ETRS89";
	else if (crs_up=="EPSG:25832")
		return "UTM32N - ETRS89";
	else if (crs_up=="EPSG:25833")
		return "UTM33N - ETRS89";
	else if (crs_up=="EPSG:25834")
		return "UTM34N - ETRS89";
	else if (crs_up=="EPSG:25835")
		return "UTM35N - ETRS89";
	else if (crs_up=="EPSG:25836")
		return "UTM36N - ETRS89";
	else if (crs_up=="EPSG:23029")
		return "UTM29N - ED50";
	else if (crs_up=="EPSG:23030")
		return "UTM30N - ED50";
	else if (crs_up=="EPSG:23031")
		return "UTM31N - ED50";
	else if (crs_up=="EPSG:23032")
		return "UTM32N - ED50";
	else if (crs_up=="EPSG:23033")
		return "UTM33N - ED50";
	else if (crs_up=="EPSG:23034")
		return "UTM34N - ED50";
	else if (crs_up=="EPSG:23035")
		return "UTM35N - ED50";
	else if (crs_up=="EPSG:23036")
		return "UTM36N - ED50";
	else if (crs_up=="EPSG:32736")
		return "UTM36S - WGS84";
	else if (crs_up=="EPSG:27563")
		return DonaCadenaLang({"cat":"Lambert C�nica Conforme Zona III - NTF", "spa":"Lambert C�nica Conforme Zona III - NTF", 
							   "eng":"Lambert Conformal Conic Zone III - NTF", "fre":"Lambert Conique Conforme Zone III �NTF"});
	else if (crs_up=="EPSG:27572")
		return DonaCadenaLang({"cat":"Lambert C�nica Conforme Zona IIext - NTF", "spa":"Lambert C�nica Conforme Zona IIext - NTF", 
						  	   "eng":"Lambert Conformal Conic Zone IIext - NTF", "fre":"Lambert Conique Conforme Zone IIext�NTF"});
	else if (crs_up=="EPSG:27573")
		return DonaCadenaLang({"cat":"Lambert C�nica Conforme Zona IIIext - NTF", "spa":"Lambert C�nica Conforme Zona IIIext - NTF", 
						   	   "eng":"Lambert Conformal Conic Zone IIIext - NTF", "fre":"Lambert Conique Conforme Zone IIIext �NTF"});
	else if (crs_up=="AUTO2:LCC,1,14.5,38,35,41")
		return DonaCadenaLang({"cat":"Lambert C�nica Conforme ICC Regi� Mediterr�nia", "spa":"Lambert C�nica Conforme ICC Regi�n Mediterr�nea", 
						   "eng":"Lambert Conformal Conic ICC Mediterranian Region", "fre":"Lambert Conique Conforme ICC R�gion M�diterran�enne"});
	else if (crs_up=="AUTO2:MERCATOR,1,0,41.42")
		return DonaCadenaLang({"cat":"Mercator paral�lel 41� 25\' - ED50", "spa":"Mercator paralelo 41�25\' - ED50", 
						   "eng":"Mercator parallel 41�25\' - ED50",  "fre":"Mercator parall�le 41�25\' - ED50"});
	else if (crs_up=="AUTO2:MERCATOR_WGS84,1,0,41.42")
		return DonaCadenaLang({"cat":"Mercator paral�lel 41� 25\' - WGS84", "spa":"Mercator paralelo 41�25\' - WGS84", 
						   "eng":"Mercator parallel 41�25\' - WGS84", "fre":"Mercator parall�le 41�25\' - WGS84"});
	else if (crs_up=="AUTO2:MERCATOR,1,0,40.60")
		return DonaCadenaLang({"cat":"Mercator paral�lel 40� 36\' - ED50", "spa":"Mercator paralelo 40�36\' - ED50", 
						   "eng":"Mercator parallel 40�36\' - ED50", "fre":"Mercator parall�le 40�36\' � ED50"});
	else if (crs_up=="AUTO2:MERCATOR,1,0,0.0")
		return DonaCadenaLang({"cat":"Mercator paral�lel Equador - ED50", "spa":"Mercator paralelo Ecuador - ED50", 
						   "eng":"Mercator parallel Equator - ED50", "fre":"Mercator parall�le Equateur � ED50"});
	else if (crs_up=="EPSG:3395")
		return DonaCadenaLang({"cat":"Mercator paral�lel Equador - WGS84", "spa":"Mercator paralelo Ecuador - WGS84", 
						   "eng":"Mercator parallel Equator - WGS84", "fre":"Mercator parall�le Equateur- WGS84"});		
	else if (crs_up=="EPSG:3785" || crs_up=="EPSG:3857")
		return DonaCadenaLang({"cat":"Web Mercator", "spa":"Web Mercator", "eng":"Web Mercator", "fre":"Web Mercator"});
	else if (crs_up=="EPSG:4326" || crs_up=="CRS:84")
		return "long/lat - WGS84";
	else if (crs_up=="EPSG:4258")
		return "long/lat - ETRS89";
	else
		return "";
}

//Es pot posar v=null si el servei no �s un WMS
function CalGirarCoordenades(crs, v)
{
	if(crs.toUpperCase()=="EPSG:4326" && (!v || (v.Vers==1 && v.SubVers>=3) || v.Vers>1))
		return true;
	return false;
}



/*
 * Returns a CRS code in the EPSG style. In case an equivalence is not found,
 * returns undefined. If the provided code is an EPSG code, itself is returned.
 * @param {type} codeCRS
 * @returns {string}
 */
function MMgetCRSEquivalentEPSG(codeCRS)
{
	if(!codeCRS)
		return undefined;
	//If this is an EPSG code, return itself
	if(codeCRS.substr(0,5)==="EPSG:")
		return codeCRS;
	//If an EPSG within an urn, return the EPSG code
	var parts= codeCRS.split(":");
	if(parts[parts.length-3]==="EPSG" && parts[parts.length-2]==="")
		return parts[parts.length-3]+":"+parts[parts.length-1];
	else if(parts[parts.length-2]==="EPSG")
		return parts[parts.length-2]+":"+parts[parts.length-1];
	//Else look in our dictionary for translation
	return {
		"urn:ogc:def:crs:OGC:1.3:CRS84": "CRS:84"
	}[codeCRS];
}
/*
 * Checks whether a given CRS is already defined in the situation map of the map browser.
 * It do not performs any type of translation or equivalencies check.
 * @param {type} codeCRS
 * @returns {Boolean}
 */
function MMisMapCompatibleCRS(codeCRS)
{
var i= ParamCtrl.ImatgeSituacio.length;

	//Upper case the name to make it comparable
	codeCRS= codeCRS.toUpperCase();

	//Loop through the situation map coordinate systems
	while(i--)
	{
		if(ParamCtrl.ImatgeSituacio[i].EnvTotal.CRS.toUpperCase()==codeCRS)
			return true;
	}
	return false;
}
