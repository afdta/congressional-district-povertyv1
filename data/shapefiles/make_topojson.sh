

#!/usr/bin/env bash

folder=/home/alec/Projects/Brookings/congressional-district-poverty

for var in 01 02 04 05 06 08 09 10 11 12 13 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 44 45 46 47 48 49 50 51 53 54 55 56
do 
$folder/node_modules/.bin/topojson -o $folder/assets/st$var.json \
--id-property GEOID -q 1e6 --simplify 0.17 --filter none --projection 'd3.geo.albersUsa()' --width 250 \
-p stfips=STATEFP,cdfips=CD114FP,geoid=GEOID,party,rep -- districts=$folder/data/shapefiles/states/$var.shp
done
