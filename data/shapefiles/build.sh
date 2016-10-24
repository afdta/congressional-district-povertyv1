#!/usr/bin/env bash

#download congressional districts file -- -N only updates if local file is older than server
wget -N http://www2.census.gov/geo/tiger/GENZ2015/shp/cb_2015_us_cd114_500k.zip

#unzip to the folder cb_2015_us_cd114_500k, only -u pdate
unzip -u -d cb_2015_us_cd114_500k cb_2015_us_cd114_500k.zip

#cleanup directory structure
if [ -e states ]
  then 
  	rm -r states
  	echo "Removed states directory"
fi

if [ -e topojson ]
  then 
  	rm -r topojson
  	echo "Removed topojson directory"
fi

mkdir states
mkdir topojson

#run r script that subsets the tract file into state shape files
Rscript subset_tracts.R 

./make_topojson.sh 

