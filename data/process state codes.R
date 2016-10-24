library("jsonlite")

states <- read.table("http://www2.census.gov/geo/docs/reference/state.txt", sep="|", header=TRUE, stringsAsFactors=FALSE, colClasses="character")

j <- toJSON(states)

writeLines(j, "~/Projects/Brookings/congressional-district-poverty/data/states.json")
