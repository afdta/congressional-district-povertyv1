library("rgdal")

pov <- read.csv("/home/alec/Projects/Brookings/congressional-district-poverty/data/Poverty Trends by District.csv", stringsAsFactors = FALSE, na.strings=c("NA",""," "))[c(-10,-15,-16,-17)]
unique(c(pov$sig_poor, pov$sig_rate))

#reduce names to 10 characters
names(pov) <- c("state", "cdid", "district", "rep", "party", 
                "poor00", "pov00", "poor1014", "pov1014", 
                "chgpoor", "sigpoor", "chgpov", "sigpov")

cd0 <- readOGR("/home/alec/Projects/Brookings/congressional-district-poverty/data/shapefiles/cb_2015_us_cd114_500k/","cb_2015_us_cd114_500k")
cd0@data$cdid <- sub("^0*", "", cd0@data$GEOID)

cd <- merge(cd0, pov, by="cdid", all.x = FALSE)

#run some tests to validate merger
mapdat <- cd@data
sum(paste0(mapdat$STATEFP,mapdat$CD114FP)==mapdat$GEOID)==nrow(mapdat)

mapdat$cd_test1 <- as.numeric(as.character(mapdat$CD114FP))
mapdat$cd_test2 <- sub("\\(at Large\\)", "00", mapdat$district) #replace at large with 00 -- this is not correct for DC, which should get special nonvoting delegate code of 98
mapdat$cd_test2 <- as.numeric(sub("Congressional District |Delegate District ", "", mapdat$cd_test2))
mapdat[mapdat$cd_test1 != mapdat$cd_test2, ]

states <- sort(unique(as.character(cd@data$STATEFP)))

makeWriteShp <- function(state){
  g <- cd[as.character(cd@data$STATEFP)==state & !is.na(cd@data$STATEFP),]
  writeOGR(g, "/home/alec/Projects/Brookings/congressional-district-poverty/data/shapefiles/states/", state, driver="ESRI Shapefile")
}

for(s in states){
  makeWriteShp(s)
}