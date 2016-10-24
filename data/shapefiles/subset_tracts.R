library("rgdal")

cd <- readOGR("/home/alec/Projects/Brookings/congressional-district-poverty/data/shapefiles/cb_2015_us_cd114_500k/","cb_2015_us_cd114_500k")

states <- sort(unique(as.character(cd@data$STATEFP)))

makeWriteShp <- function(state){
  g <- cd[as.character(cd@data$STATEFP)==state & !is.na(cd@data$STATEFP),]
  writeOGR(g, "/home/alec/Projects/Brookings/congressional-district-poverty/data/shapefiles/states/", state, driver="ESRI Shapefile")
}

for(s in states){
  makeWriteShp(s)
}