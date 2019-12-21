/*
 * Function that, when a country is selected in the bar chart or in the map of the general analysis section,
 * does the brushing on the other visualizations, which means, adding/changing the colors on the radar plot and
 * add/remove the country from the comparison table.
 * countryName is the country's name and must be a string.
 * From: https://jsfiddle.net/rsb2097/xeppz7L6/
 */
function selectCountryOnGeneralAnalysis(countryName) {
    // If the country was already selected.
    if (generalMapPaths.filter(d => d.properties.name === countryName).style("fill") !== "rgb(220, 173, 139)") {
        // Changes the color of the country, in the map, to the default color.
        generalMapPaths.filter(d => d.properties.name === countryName).style("fill", "rgb(220, 173, 139)");

        // Changes the color of the country bar, in the bar chart, to the default color.
        generalBarsRect.filter(d => d.Country === countryName).style("fill", "rgb(220, 173, 139)");

        // Removes the row, in the comparison table, corresponding to the country,
        // if there's more than one selected country.
        if (legendOptions.length > 1) {
            generalTable.select("#" + countryName.replace(/\s/g, '') + "GeneralRow").remove();
        }

        // Removes the country values from the radar plot, and updates the available colors to use.
        for (let index in legendOptions) {
            if (legendOptions[index] === countryName && legendOptions.length > 1) {
                legendOptions.splice(index, 1);
                selectedCountriesRadarPlot.splice(index, 1);
                drawRadarCharts(selectedCountriesRadarPlot, legendOptions);
                break;
            }
        }
    }
    // If the country wasn't already selected.
    else {
        let selectedCountry;

        // Checks if the selected country exists, so it may be added to the comparison table.
        for (let index in countriesData) {
            if (countriesData[index].Country === countryName) {
                selectedCountry = countriesData.slice(index, parseInt(index)+1);
                break;
            }
        }

        // Adds the selected country values as a row in the comparison table.
        generalTable.append('tr')
            .attr('id', countryName.replace(/\s/g, '') + "GeneralRow")
            .data(selectedCountry)
            .selectAll('td')
            .data(function(row, i) {
                return tableColumns.map(function(c) {
                    // compute cell values for this specific row
                    let cell = {};

                    d3.keys(c).forEach(function(k) {
                        cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                    });

                    return cell;
                });
            })
            .enter()
            .append('td')
            .html(function (d) {
                return d.html;
            })
            .attr('class', function (d) {
                return d.cl;
            });

        // Inserts the country values into the radar plot.
        for (let index in radarPlotData) {
            if (radarPlotData[index][0].name === countryName && !legendOptions.includes(countryName)) {
                let country = Object.create(radarPlotData[index]);
                country.splice(0, 1);
                selectedCountriesRadarPlot.push(country);
                legendOptions.push(countryName);
                drawRadarCharts(selectedCountriesRadarPlot, legendOptions);
                break;
            }
        }
    }

    // Changes the colors of the selected countries to be in accord with the radar plot colors.
    for (let index in legendOptions) {
        // Changes the color of the selected countries in the colorized map of the general analysis section.
        generalMapPaths.filter(d => d.properties.name === legendOptions[index]).style("fill", function (d) {
            return generalColorScale(legendOptions.indexOf(d.properties.name));
        });

        // Changes the color of the bars of the selected countries in the bar chart in the general analysis section.
        generalBarsRect.filter(d => d.Country === legendOptions[index]).style("fill", function (d) {
            return generalColorScale(legendOptions.indexOf(d.Country));
        });
    }
}

/*
 * Function that resets the colorized map to its default state, in the general analysis section.
 * From: https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78
 */
function resetGeneralMap() {
    generalMapPaths.style("fill", "rgb(220, 173, 139)");
    generalBarsRect.style("fill", "rgb(220, 173, 139)");
    generalMap.call(generalZoom.transform, d3.zoomIdentity.scale(1));
}

/*
 * Function that makes zoom on the colorized map in the general analysis section.
 * zoomStep is the amount of zoom to do in the map and must be a number.
 * From: https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78
 */
function clickToZoomGeneralMap(zoomStep) {
    generalMap.transition()
        .call(generalZoom.scaleBy, zoomStep);
}

/*
 * Function that draws all the countries in the colorized map, based on the geolocations.
 * geoData is the necessary information (name, geolocation, etc.) of a country to be displayed in the map.
 * From: https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78
 */
function drawGeneralMap(geoData) {
    generalMapPaths = generalMap.append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", d => path(d))
        .attr("fill", "rgb(220, 173, 139)")
        .attr("stroke", "black")
        .attr("stroke-width", "0.5px")
        .attr("cursor", "pointer")
        .on("click", function (d) {
            selectCountryOnGeneralAnalysis(d.properties.name);
        });

    // Add the first country as an example.
    generalMapPaths.filter(d => d.properties.name === "Finland").style("fill", generalColorScale(0));
}

/*
 * Function that, when a country is selected in the bar chart or in the map of the detailed analysis section,
 * does the brushing on the other visualizations, which means, adding/changing the colors on the parallel plot and
 * add/remove the country from the comparison table.
 * countryName is the country's name and must be a string.
 * From: https://www.d3-graph-gallery.com/graph/parallel_basic.html
 */
function selectCountryOnDetailedAnalysis(countryName) {
    // If the country was already selected.
    if (detailedMapPaths.filter(d => d.properties.name === countryName).style("fill") !== "rgb(220, 173, 139)") {
        // If there's more than one country selected.
        if (detailedTable.selectAll('tr')._groups[0].length > 2) {
            detailedMapPaths.filter(d => d.properties.name === countryName).style("fill", "rgb(220, 173, 139)");
            detailedBarsRect.filter(d => d.Country === countryName).style("fill", "rgb(220, 173, 139)");
            detailedTable.select("#" + countryName.replace(/\s/g, '') + "DetailedRow").remove();
            parallelPlot.select("#" + countryName.replace(/\s/g, '')).remove();
        }
    }
    // If the country wasn't already selected.
    else {
        detailedMapPaths.filter(d => d.properties.name === countryName)
            .style("fill", detailedColorScale(countries.indexOf(countryName)));
        detailedBarsRect.filter(d => d.Country === countryName)
            .style("fill", detailedColorScale(countries.indexOf(countryName)));
        let selectedCountry;

        // Searches for the selected country data to be inserted into the comparison table,
        // in the detailed analysis section.
        for (let index in countriesData) {
            if (countriesData[index].Country === countryName) {
                selectedCountry = countriesData.slice(index, parseInt(index)+1);
                break;
            }
        }

        // Inserts the country's data in a row of the table.
        detailedTable.append('tr')
            .attr('id', countryName.replace(/\s/g, '') + "DetailedRow")
            .data(selectedCountry)
            .selectAll('td')
            .data(function(row, i) {
                return tableColumns.map(function(c) {
                    // compute cell values for this specific row
                    let cell = {};

                    d3.keys(c).forEach(function(k) {
                        cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                    });

                    return cell;
                });
            })
            .enter()
            .append('td')
                .html(function (d) {
                    return d.html;
                })
                .attr('class', function (d) {
                    return d.cl;
                });

        // Extract the list of dimensions to keep in the plot. Keep all except the column called Country.
        let dimensions = d3.keys(countriesData[0]).filter(function(d) { return d !== "Country" });

        // For each dimension, build a linear scale. Store all in a y object.
        let y = {};

        for (let i in dimensions) {
            const name = dimensions[i];

            y[name] = d3.scaleLinear()
                .domain(d3.extent(countriesData, function(d) { return +d[name]; }))
                .range([height, 0])
        }

        // Build the X scale -> find the best position for each Y axis.
        let x = d3.scalePoint()
            .range([0, width])
            .padding(1)
            .domain(dimensions);

        // Add the selected country in the parallel plot.
        parallelPlot.append("path")
            .data(selectedCountry)
            .attr("d",  function (d) {
                return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
            })
            .attr("id", countryName.replace(/\s/g, ''))
            .style("fill", "none")
            .style("stroke", detailedColorScale(countries.indexOf(countryName)));
    }
}

/*
 * Function that resets the colorized map to its default state, in the detailed analysis section.
 * From: https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78
 */
function resetDetailedMap() {
    detailedMapPaths.style("fill", "rgb(220, 173, 139)");
    detailedBarsRect.style("fill", "rgb(220, 173, 139)");
    detailedMap.call(detailedZoom.transform, d3.zoomIdentity.scale(1));
}

/*
 * Function that makes zoom on the colorized map in the detailed analysis section.
 * zoomStep is the amount of zoom to do in the map and must be a number.
 * From: https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78
 */
function clickToZoomDetailedMap(zoomStep) {
    detailedMap.transition()
        .call(detailedZoom.scaleBy, zoomStep);
}

/*
 * Function that draws all the countries in the colorized map, based on the geolocations.
 * geoData is the necessary information (name, geolocation, etc.) of a country to be displayed in the map.
 * From: https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78
 */
function drawDetailedMap(geoData) {
    detailedMapPaths = detailedMap.append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", d => path(d))
        .attr("fill", "rgb(220, 173, 139)")
        .attr("stroke", "black")
        .attr("stroke-width", "0.5px")
        .attr("cursor", "pointer")
        .on("click", function (d) {
            selectCountryOnDetailedAnalysis(d.properties.name);
        });

    detailedMapPaths.filter(d => d.properties.name === "Finland").style("fill", detailedColorScale(0));
}

let countriesData, generalMapPaths, generalBarsRect, detailedMapPaths, detailedBarsRect;
let radarPlotData = [], legendOptions = [], selectedCountriesRadarPlot = [], countries = [];

// Color scale to use, in the general analysis visualizations, for each selected country.
const generalColorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Color scale to use, in the detailed analysis visualizations, for each selected country.
const detailedColorScale = d3.scaleOrdinal(d3.schemeCategory10);

// ############## GENERAL ANALYSIS COLORIZED MAP ##############
// Zoom to be used on the map, in the general analysis section.
const generalZoom = d3.zoom()
    .scaleExtent([0.8, 5])
    .on("zoom", function () {
        generalMap.attr("transform", d3.event.transform);
    });

// Svg for the colorized map, in the general analysis section.
const generalMap = d3.select("#map")
    .append("svg")
    .attr("height", 500)
    .attr("width", "100%")
    .call(generalZoom)
    .append("g");

const projection = d3.geoMercator().scale(170);

const path = d3.geoPath().projection(projection);

d3.select("#btn-zoom-in").on("click", () => clickToZoomGeneralMap(2));
d3.select("#btn-zoom-out").on("click", () => clickToZoomGeneralMap(0.5));
d3.json("assets/world_countries.json").then(drawGeneralMap);

// ############## GENERAL ANALYSIS BAR CHART ##############
const generalBarChart = d3.select("#bar-chart").append("svg")
    .attr("height", "3050px")
    .attr("width", "500px");

// ############## GENERAL ANALYSIS COMPARISON TABLE ##############
const tableColumns = [
    { head: "Country", cl: "title",
        html: function(row) { return row.Country; } },
    { head: "Ladder", cl: "num",
        html: function(row) { return row.Ladder; } },
    { head: "SD of Ladder", cl: "num",
        html: function(row) { return row.SDLadder; } },
    { head: "Positive Affect", cl: "num",
        html: function(row) { return row.PositiveAffect; } },
    { head: "Negative Affect", cl: "num",
        html: function(row) { return row.NegativeAffect; } },
    { head: "Social Support", cl: "num",
        html: function(row) { return row.SocialSupport; } },
    { head: "Freedom", cl: "num",
        html: function(row) { return row.Freedom; } },
    { head: "Corruption", cl: "num",
        html: function(row) { return row.Corruption; } },
    { head: "Generosity", cl: "num",
        html: function(row) { return row.Generosity; } },
    { head: "GDP per capita", cl: "num",
        html: function(row) { return row.GDP; } },
    { head: "Life Expectancy", cl: "num",
        html: function(row) { return row.LifeExpectancy; } },
];

const generalTable = d3.select("#table")
    .append("table")
    .attr("class", "table default");

generalTable.append('thead')
    .append('tr')
        .selectAll('th')
        .data(tableColumns)
        .enter()
            .append('th')
            .attr('class', function (d) {
                return d.cl;
            })
            .text(function (d) {
                return d.head;
            })
            .append('tbody');

// ############## DETAILED ANALYSIS COLORIZED MAP ##############
const detailedZoom = d3.zoom()
    .scaleExtent([0.8, 5])
    .on("zoom", function () {
        detailedMap.attr("transform", d3.event.transform);
    });

const detailedMap = d3.select("#map2")
    .append("svg")
    .attr("height", 500)
    .attr("width", "100%")
    .call(detailedZoom)
    .append("g");

d3.select("#btn-zoom-in2").on("click", () => clickToZoomDetailedMap(2));
d3.select("#btn-zoom-out2").on("click", () => clickToZoomDetailedMap(0.5));
d3.json("assets/world_countries.json").then(drawDetailedMap);

// ############## DETAILED ANALYSIS BAR CHART ##############
const detailedBarChart = d3.select("#bar-chart2").append("svg")
    .attr("height", "3050px")
    .attr("width", "500px");

// ############## DETAILED ANALYSIS COMPARISON TABLE ##############
const detailedTable = d3.select("#table2")
    .append("table")
    .attr("class", "table default");

detailedTable.append('thead')
    .append('tr')
        .selectAll('th')
        .data(tableColumns)
        .enter()
            .append('th')
            .attr('class', function (d) {
                return d.cl;
            })
            .text(function (d) {
                return d.head;
            })
            .append('tbody');

// ############## DETAILED ANALYSIS PARALLEL PLOT ##############
// Dimensions and margins for the parallel plot
let margin = { top: 30, right: 10, bottom: 10, left: 0 },
    width = 1100 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const parallelPlot = d3.select("#parallel-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("assets/world-happiness-report-2019.csv")
    .then(function(data) {
        // Countries data to be inserted into the bar charts.
        let ladder = [];

        // Countries data to be inserted into the comparison tables.
        countriesData = data;

        // Country to be used as an example for the visualizations.
        const firstCountry = countriesData.slice(0, 1);

        data.forEach(function (item, index) {
            ladder.push({"Country": item.Country, "Ladder": item.Ladder});
            countries.push(item.Country);

            // All countries data to be used in the radar plot.
            radarPlotData.push([
                { name: item.Country },
                { axis: "Ladder", value: Math.round(Math.log(item.Ladder) + 1) },
                { axis: "SD of Ladder", value: Math.round(Math.log(item.SDLadder) + 1) },
                { axis: "Positive Affect", value: Math.round(Math.log(item.PositiveAffect) + 1) },
                { axis: "Negative Affect", value: Math.round(Math.log(item.NegativeAffect) + 1) },
                { axis: "Corruption", value: Math.round(Math.log(item.Corruption) + 1) },
                { axis: "Freedom", value: Math.round(Math.log(item.Freedom) + 1) },
                { axis: "GDP per capita", value: Math.round(Math.log(item.GDP) + 1) },
                { axis: "Generosity", value: Math.round(Math.log(item.Generosity) + 1) },
                { axis: "Life Expectancy", value: Math.round(Math.log(item.LifeExpectancy) + 1) },
                { axis: "Social Support", value: Math.round(Math.log(item.SocialSupport) + 1) }
            ]);

            if (index === 0) {
                // Add the first country as an example to be inserted into the radar plot.
                selectedCountriesRadarPlot = [[
                    { axis: "Ladder", value: Math.round(Math.log(item.Ladder) + 1) },
                    { axis: "SD of Ladder", value: Math.round(Math.log(item.SDLadder) + 1) },
                    { axis: "Positive Affect", value: Math.round(Math.log(item.PositiveAffect) + 1) },
                    { axis: "Negative Affect", value: Math.round(Math.log(item.NegativeAffect) + 1) },
                    { axis: "Corruption", value: Math.round(Math.log(item.Corruption) + 1) },
                    { axis: "Freedom", value: Math.round(Math.log(item.Freedom) + 1) },
                    { axis: "GDP per capita", value: Math.round(Math.log(item.GDP) + 1) },
                    { axis: "Generosity", value: Math.round(Math.log(item.Generosity) + 1) },
                    { axis: "Life Expectancy", value: Math.round(Math.log(item.LifeExpectancy) + 1) },
                    { axis: "Social Support", value: Math.round(Math.log(item.SocialSupport) + 1) }
                ]];

                legendOptions.push(item.Country);

                // Draws the radar plot with the first country.
                drawRadarCharts(selectedCountriesRadarPlot, legendOptions);
            }
        });

        // Adds all the countries happiness scores, based on the cartil ladder, into the general analysis bar chart.
        generalBarsRect = generalBarChart.selectAll("rect")
            .data(ladder.reverse())
            .enter()
            .append("rect")
            .attr("fill", "rgb(220, 173, 139)")
            .attr("x", function(d, i) {
                return i * (3000 / ladder.length);
            })
            .attr("width", 10)
            .attr("height", function (d) {
                return ladder.length - d.Ladder;
            })
            .attr("transform", "translate(50,3010)rotate(270)")
            .attr("cursor", "pointer")
            .on("click", function (d) {
                selectCountryOnGeneralAnalysis(d.Country);
            });

        // Adds the country name next to each bar.
        generalBarChart.selectAll("text")
            .data(countries)
            .enter()
            .append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * (3000 / countries.length)
            })
            .attr("transform", "translate(220,30)");

        // Changes the color of the first country, in the general analysis bar chart, to indicate that it's selected.
        generalBarsRect.filter(d => d.Country === firstCountry[0].Country).style("fill", generalColorScale(0));

        // Adds the first country values as a row in the general analysis comparison table.
        generalTable.append('tr')
            .attr('id', firstCountry[0].Country.replace(/\s/g, '') + "GeneralRow")
            .data(firstCountry)
            .selectAll('td')
            .data(function(row, i) {
                return tableColumns.map(function(c) {
                    // Compute cell values for this specific row
                    let cell = {};

                    d3.keys(c).forEach(function(k) {
                        cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                    });

                    return cell;
                });
            })
            .enter()
            .append('td')
            .html(function (d) {
                return d.html;
            })
            .attr('class', function (d) {
                return d.cl;
            });

        // Adds all the countries happiness scores, based on the cartil ladder, into the detailed analysis bar chart.
        detailedBarsRect = detailedBarChart.selectAll("rect")
            .data(ladder)
            .enter()
            .append("rect")
            .attr("fill", "rgb(220, 173, 139)")
            .attr("x", function(d, i) {
                return i * (3000 / ladder.length);
            })
            .attr("width", 10)
            .attr("height", function (d) {
                return ladder.length - d.Ladder;
            })
            .attr("transform", "translate(50,3010)rotate(270)")
            .attr("cursor", "pointer")
            .on("click", function (d) {
                selectCountryOnDetailedAnalysis(d.Country);
            });

        // Adds the country name next to each bar.
        detailedBarChart.selectAll("text")
            .data(countries)
            .enter()
            .append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return i * (3000 / countries.length)
            })
            .attr("transform", "translate(220,30)");

        // Changes the color of the first country, in the detailed analysis bar chart, to indicate that it's selected.
        detailedBarsRect.filter(d => d.Country === firstCountry[0].Country).style("fill", detailedColorScale(0));

        // Adds the first country values as a row in the detailed analysis comparison table.
        detailedTable.append('tr')
            .attr('id', firstCountry[0].Country.replace(/\s/g, '') + "DetailedRow")
            .data(firstCountry)
            .selectAll('td')
            .data(function(row, i) {
                return tableColumns.map(function(c) {
                    // compute cell values for this specific row
                    let cell = {};

                    d3.keys(c).forEach(function(k) {
                        cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                    });

                    return cell;
                });
            })
            .enter()
            .append('td')
            .html(function (d) {
                return d.html;
            })
            .attr('class', function (d) {
                return d.cl;
            });

        // Extract the list of dimensions to keep in the plot. Keep all except the column called Country.
        let dimensions = d3.keys(data[0]).filter(function(d) { return d !== "Country" });

        // For each dimension, build a linear scale. Store all in a y object.
        let y = {};

        for (let i in dimensions) {
            const name = dimensions[i];

            y[name] = d3.scaleLinear()
                .domain( d3.extent(data, function(d) { return +d[name]; }) )
                .range([height, 0])
        }

        // Build the X scale -> find the best position for each Y axis.
        let x = d3.scalePoint()
            .range([0, width])
            .padding(1)
            .domain(dimensions);

        // Draws the x and y axis of the parallel plot.
        parallelPlot.selectAll("axis")
            .data(dimensions)
            .enter()
            .append("g")
            // Translate this element to its right position on the x axis.
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            // Build the axis with the call function.
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            // Add axis title.
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "white");

        // Adds the first country values into the parallel plot.
        parallelPlot.append("path")
            .data(firstCountry)
            .attr("d",  function (d) {
                return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
            })
            .attr("id", firstCountry[0].Country.replace(/\s/g, ''))
            .style("fill", "none")
            .style("stroke", detailedColorScale(0));
    })
    .catch(function(error){
        console.log(error);
    });