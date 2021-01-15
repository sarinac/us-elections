//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// DIMENSIONS ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

// Containers
var heightTable = 600,
    heightGrid = 2000,
    heightScenario = 600,
    widthWinner = 200,
    widthYear = 100,
    widthElectoralVotes = 200,
    widthElectoralStates = 600,
    widthParticipation = 80
    width = widthWinner + widthYear + widthElectoralVotes + widthElectoralStates + widthParticipation;

// Padding
var padding = {
    top: 100,
    right: 20,
    bottom: 20,
    left: 20,
};

// Border
var border = 3;

// Tooltip
var tooltipWidth = 40,
    tooltipHeight = 30;

// SVG for table
tableSVG = d3.selectAll("#yearly-results-table")
    .append("svg")
        .attr("width", width)
        .attr("height", heightTable);

// SVG for grid
gridSVG = d3.selectAll("#yearly-results-grid")
    .append("svg")
        .attr("width", width)
        .attr("height", heightGrid);

// SVG for grid
scenarioSVG = d3.selectAll("#electoral-votes-scenarios")
    .append("svg")
        .attr("width", width)
        .attr("height", heightScenario);

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// READ DATA ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

d3.csv("data/election_results.csv", (error, data) => {

	if (error) throw error;

    // Convert data types
    for(var i = 0; i < data.length; i++) { 

        data[i].year = +data[i].year; // numeric
        data[i].state = "" + data[i].state; // string
        data[i].state_po = "" + data[i].state_po; // string
        data[i].total_votes = +data[i].total_votes; // numeric
        data[i].electoral_votes = +data[i].electoral_votes; // numeric
        data[i].democrat_votes = +data[i].democrat_votes; // numeric
        data[i].republican_votes = +data[i].republican_votes; // numeric
        data[i].other_votes = +data[i].other_votes; // numeric
        data[i].democrat_pct = +data[i].democrat_pct; // numeric
        data[i].republican_pct = +data[i].republican_pct; // numeric
        data[i].other_pct = +data[i].other_pct; // numeric
        data[i].more_democrat = +data[i].more_democrat; // numeric
        data[i].winning_party = "" + data[i].winning_party; // string
        data[i].candidate_name = "" + data[i].candidate_name; // string
        data[i].democrat_electoral_votes = +data[i].democrat_electoral_votes; // numeric
        data[i].republican_electoral_votes = +data[i].republican_electoral_votes; // numeric

    };

    //////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////// TABLE //////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////

    generateTable = () => {

        // Headers ///////////////////////////////////////////////////////////////////////////////////

        headers = tableSVG.append("g").classed("text-center", true).classed("header", true);

        headers
            .append("text")
                .attr("x", widthWinner / 2)
                .attr("y", padding.top / 2)
                .text("WINNER");

        headers
            .append("text")
                .attr("x", widthWinner + widthYear / 2)
                .attr("y", padding.top / 2)
                .text("YEAR");

        headers
            .append("text")
                .attr("x", widthWinner + widthYear + widthElectoralVotes / 2)
                .attr("y", padding.top / 2)
                .text("ELECTORAL VOTES");

        headers
            .append("text")
                .attr("x", widthWinner + widthYear + widthElectoralVotes + widthElectoralStates / 2)
                .attr("y", padding.top / 2)
                .text("STATE VOTES");
        
        headers
            .append("text")
                .attr("x", widthWinner + widthYear + widthElectoralVotes + widthElectoralStates + widthParticipation / 2)
                .attr("y", padding.top / 2)
                .text("VOTERS");

        // Y Scale ///////////////////////////////////////////////////////////////////////////////////

        // Get first election year, last election year, number of elections
        var electionYearFirst = d3.min(data, d => d.year),
        electionYearLast = d3.max(data, d => d.year),
        numberElections = (electionYearLast - electionYearFirst) / 4;

        // Calculate height of each election year
        var tableY = (heightTable - padding.top - padding.bottom) / numberElections,
            tableHeight = tableY / 2;

        // yScale for Year
        tableYScale = d3.scaleLinear()
            .domain([electionYearFirst, electionYearLast])
            .range([padding.top, heightTable - padding.bottom - tableY]);

        // Aggregate data by year ////////////////////////////////////////////////////////////////////

        let yearData = d3.nest()
            .key(d => d.year)
            .rollup(v => {
                return {
                    democrat: d3.sum(v, d => d.democrat_electoral_votes),
                    republican: d3.sum(v, d => d.republican_electoral_votes),
                    totals: d3.sum(v, d => d.total_votes),
                    democratCandidate: d3.max(v, d => d.winning_party == "democrat" ? d.candidate_name: ""),
                    republicanCandidate: d3.max(v, d => d.winning_party == "republican" ? d.candidate_name: "")
                }
            })
            .entries(data); 

        // Winners ///////////////////////////////////////////////////////////////////////////////////

        tableSVG
            .append("g")
                .selectAll("rect")
                .data(yearData)
                .enter()
                .append("rect")
                    .attr("x", padding.left)
                    .attr("y",  d => tableYScale(d.key))
                    .attr("width", widthWinner - padding.right - padding.left)
                    .attr("height", tableHeight)
                    .attr("class", d => d.value.democrat > d.value.republican ? "democrat" : "republican");
        
        tableSVG
            .append("g")
                .selectAll("rect")
                .data(yearData)
                .enter()
                .append("rect")
                    .attr("x", padding.left + border)
                    .attr("y",  d => tableYScale(d.key) + border)
                    .attr("width", widthWinner - padding.right - padding.left - border * 2)
                    .attr("height", tableHeight - border * 2)
                    .classed("textbox-fill", true);

        tableSVG
            .append("g")
                .selectAll("text")
                .data(yearData)
                .enter()
                .append("text")
                    .attr("x", widthWinner / 2)
                    .attr("y",  d => tableYScale(d.key) + tableHeight / 2 + 1)
                    .text(d => d.value.democrat > d.value.republican ? d.value.democratCandidate : d.value.republicanCandidate)
                    .classed("text-center", true);

        // Years /////////////////////////////////////////////////////////////////////////////////////

        tableSVG
            .append("g")
                .selectAll("text")
                .data(yearData)
                .enter()
                .append("text")
                    .attr("x", widthWinner + widthYear / 2)
                    .attr("y",  d => tableYScale(d.key) + tableHeight / 2 + 1)
                    .text(d => d.key)
                    .classed("text-center", true);
        
        // Electoral Votes ///////////////////////////////////////////////////////////////////////////

        // X Scale
        electoralVotesXScale = d3.scaleLinear()
            .domain([0, 538]) // Number of electoral votes
            .range([padding.left, widthElectoralVotes - padding.right])

        yearsSVG = tableSVG.append("g");

        for (party of ["democrat", "republican"]){

            yearsSVG
                .append("g")
                    .classed(party, true)
                    .selectAll("rect")
                    .data(yearData)
                    .enter()
                    .append("rect")
                        .attr("x", d => widthWinner + widthYear
                            + electoralVotesXScale(party == "democrat" ? 0 : 538 - d.value[party]))
                        .attr("y", d => tableYScale(d.key))
                        .attr("width", d =>  electoralVotesXScale(d.value[party]) - padding.left)
                        .attr("height", tableHeight);
            
            yearsSVG
                .append("g")
                    .selectAll("text")
                    .data(yearData)
                    .enter()
                    .append("text")
                        .attr("x", d => widthWinner + widthYear
                            + electoralVotesXScale(party == "democrat" ? 0 : 538))
                        .attr("y", d => tableYScale(d.key) - 2)
                        .text(d => d.value[party])
                        .classed(`${party}-align`, true)
                        .classed("electoral-votes-text", true);
        };

        // Draw line down the middle
        yearsSVG
            .append("g")
                .append("path")
                    .attr("d", `M${widthWinner + widthYear + widthElectoralVotes / 2},${padding.top  - tableHeight/2} l0,${heightTable - padding.bottom - padding.top}`)
                    .classed("finish-line", true);

        // Electoral States //////////////////////////////////////////////////////////////////////////

        // Get highest variance between democrats and republicans
        var maxVariance = Math.max(
            Math.abs(d3.min(data, d => d.more_democrat)), 
            Math.abs(d3.max(data, d => d.more_democrat))
        );

        // X Scale for party variance
        electoralStatesXScale = d3.scaleLinear()
            .domain([-maxVariance, maxVariance])
            .range([padding.left, widthElectoralStates - padding.right]);

        // Radial Scale for state's electoral votes
        electoralStatesRScale = d3.scaleSqrt()
            .domain([1, 55]) // CA has the most electoral votes (55)
            .range([1, tableHeight]);

        // Get list of states
        const states = d3.map(data, d => d.state_po).keys().sort((a, b) => a - b);

        statesSVG = tableSVG.append("g"); // This has to come before tooltip

        // Add tooltip
        tooltip = tableSVG.append("g").attr("id", "tooltip").classed("hidden", true);

        tooltip // need to update x, fill
            .append("rect")
                .attr("x", 0) 
                .attr("y", padding.top - tooltipHeight - border)
                .attr("width", tooltipWidth)
                .attr("height", tooltipHeight)
                .attr("id", "tooltip-border");
            
        tooltip // need to update x
            .append("rect")
                .attr("x", border)
                .attr("y", padding.top - (tooltipHeight - border) - border)
                .attr("width", tooltipWidth - border * 2)
                .attr("height", tooltipHeight - border * 2)
                .classed("textbox-fill", true)
                .attr("id", "tooltip-fill");;

        tooltip // need to update text
            .append("text")
            .attr("x", 0)
            .attr("y", padding.top - tooltipHeight / 2)
            .classed("text-center", true)
            .attr("id", "tooltip-text");;

        let updateStates = d => {
            
            // Parse record based on what object was selected (single if circle, multiple if line)
            if (d.length > 1){
                d = d[0]
            };

            // Update tooltip
            let tooltip = d3.select("#tooltip");
            tooltip
                .classed("hidden", false);
            tooltip.select("#tooltip-border")
                .attr("x", widthWinner + widthYear + widthElectoralVotes + electoralStatesXScale(d.more_democrat) - tooltipWidth / 2)
                .attr("class", d.winning_party);
            tooltip.select("#tooltip-fill")
                .attr("x", widthWinner + widthYear + widthElectoralVotes + electoralStatesXScale(d.more_democrat) - tooltipWidth / 2 + border);
            tooltip.select("#tooltip-text")
                .attr("x", widthWinner + widthYear + widthElectoralVotes + electoralStatesXScale(d.more_democrat))
                .text(d.state_po);
            
            // Update graphic
            d3.selectAll(".electoral-states-circle")
                .filter(v => v.state_po != d.state_po)
                .classed("electoral-states-inactive", true);
            d3.selectAll(".electoral-states-circle")
                .filter(v => v.state_po == d.state_po)
                .classed("electoral-states-active", true);
            d3.selectAll(".electoral-states-line")
                .filter(v => v[0].state_po == d.state_po)
                .classed("electoral-states-active", true);

        };

        let unUpdateStates = () => {

            d3.select("#tooltip")
                .classed("hidden", true);
            d3.selectAll(".electoral-states-circle")
                .classed("electoral-states-inactive", false)
                .classed("electoral-states-active", false);
            d3.selectAll(".electoral-states-line")
                .classed("electoral-states-active", false);

        };
  
        // Draw ticks and reference lines
        statesHeaders = statesSVG.append("g");

        for(var i = -.8; i <= .8; i=i+.2) { 

            statesHeaders
                .append("text")
                    .attr("x", widthWinner + widthYear + widthElectoralVotes + electoralStatesXScale(i))
                    .attr("y", padding.top - 2)
                    .text(`${Math.abs(i) < .1 ? "" : (i < 0 ? "R+" : "D+")}${Math.abs(i*100).toFixed(0)}%`)
                    .classed("electoral-votes-text", true)
                    .style("text-anchor", "middle")
                    .style("fill", "grey");
            
            statesHeaders
                .append("path")
                    .attr("d", `M${widthWinner + widthYear + widthElectoralVotes + electoralStatesXScale(i)},${padding.top - tableHeight/2} l0,${heightTable - padding.bottom - padding.top}`)
                    .classed("finish-line", true)
                    .style("opacity", .4)
                    .style("stroke-width", .5);
        };

        // Draw lines
        for (state of states){

            let dataset = data.filter(d => d.state_po == state).sort((a, b) => a.year - b.year);

            statesSVG
                .append("g")
                    .attr("id", `electoral-states-line-${state}`)
                    .append("path")
                    .datum(dataset)
                        .attr("d", d3.line()
                            .curve(d3.curveCatmullRom.alpha(0.5))
                            .x(d => widthWinner + widthYear + widthElectoralVotes + electoralStatesXScale(d.more_democrat))
                            .y(d => tableYScale(d.year) + tableHeight / 2)
                        )
                        .classed("electoral-states-line", true)
                        .on("mouseover", d => updateStates(d))
                        .on("mouseout", unUpdateStates);

        };

        // Draw line down the middle
        statesSVG
            .append("g")
                .append("path")
                    .attr("d", `M${widthWinner + widthYear + widthElectoralVotes + widthElectoralStates / 2},${padding.top - tableHeight/2} l0,${heightTable - padding.bottom - padding.top}`)
                    .classed("finish-line", true);

        // Draw circles
        for (state of states){

            let dataset = data.filter(d => d.state_po == state);

            statesSVG
                .append("g")
                    .attr("id", `electoral-states-circle-${state}`)
                    .selectAll("circle")
                    .data(dataset)
                    .enter()
                    .append("circle")
                        .attr("cx", d => widthWinner + widthYear + widthElectoralVotes + electoralStatesXScale(d.more_democrat))
                        .attr("cy", d => tableYScale(d.year) + tableHeight / 2)
                        .attr("r", d => electoralStatesRScale(d.electoral_votes))
                        .attr("class", d => d.winning_party == "democrat" ? "democrat" : "republican")
                        .classed("electoral-states-circle", true)
                        .on("mouseover", d => updateStates(d))
                        .on("mouseout", unUpdateStates);

        };

        // Participation /////////////////////////////////////////////////////////////////////////////

        participationRScale = d3.scaleLinear()
            .domain([0, d3.max(yearData, d => d.value.totals)])
            .range([0, Math.min(widthParticipation / 2, tableHeight * 1.2)]);

        participationSVG = tableSVG.append("g");

        participationSVG
            .append("g")
                .selectAll("circle")
                .data(yearData)
                .enter()
                .append("circle")
                    .attr("cx", widthWinner + widthYear + widthElectoralVotes + widthElectoralStates + widthParticipation / 2)
                    .attr("cy", d => tableYScale(d.key) + tableHeight / 2)
                    .attr("r", d => participationRScale(d.value.totals))
                    .classed("voter-participation", true);
        
        participationSVG
            .append("g")
                .selectAll("text")
                .data(yearData)
                .enter()
                .append("text")
                    .attr("x", widthWinner + widthYear + widthElectoralVotes + widthElectoralStates + widthParticipation / 2)
                    .attr("y", d => tableYScale(d.key) + tableHeight / 2)
                    .text(d => `${(d.value.totals / 1000000).toFixed(0)}M`)
                    .classed("text-center", true);


    };
    
    //////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////// GRIDS //////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////

    generateGrids = () => {

        // Filter to states 
        let dataStates = data.filter(d => d.state_po != "DC");

        // Get list of states 
        const states = d3.map(dataStates, d => d.state).keys().sort((a, b) => a - b);

        // Scales ////////////////////////////////////////////////////////////////////////////////////

        // Split SVG into grid (10 x 5)
        var widthGridCol = (width - padding.left - padding.right) / 5,
            heightGridRow = (heightGrid - padding.top - padding.bottom) / 10;

        // Get highest variance between democrats and republicans
        var maxVariance = Math.max(
            Math.abs(d3.min(dataStates, d => d.more_democrat)), 
            Math.abs(d3.max(dataStates, d => d.more_democrat))
        );

        // Get first election year, last election year, number of elections
        var electionYearFirst = d3.min(dataStates, d => d.year),
            electionYearLast = d3.max(dataStates, d => d.year);

        // X Scale for party variance
        xScale = d3.scaleLinear()
            .domain([-maxVariance, maxVariance])
            .range([padding.left, widthGridCol - padding.right]);
        
        // Y Scale for year
        yScale = d3.scaleLinear()
            .domain([electionYearFirst, electionYearLast])
            .range([padding.top, heightGridRow - padding.bottom]);

        // Radial Scale for state's electoral votes
        rScale = d3.scaleSqrt()
            .domain([1, 55]) // CA has the most electoral votes (55)
            .range([2, 8]); // Arbitrary size

        // Draw //////////////////////////////////////////////////////////////////////////////////////

        var row = 0,
            col = 0;

        for (state of states){
            
            let dataset = dataStates.filter(d => d.state == state);

            // Title
            gridSVG
                .append("g")
                    .append("text")
                        .attr("x", (row % 5) * widthGridCol + widthGridCol / 2)
                        .attr("y", parseInt(col/5) * heightGridRow + padding.top * 0.75)
                        .classed("text-center", true)
                        .classed("header", true)
                        .attr("id", `grids-results-title-${state}`)
                        .text(state);

            // Draw ticks and reference lines
            gridHeaders = gridSVG.append("g");

            for(var i = -.4; i <= .4; i=i+.4) { 

                gridHeaders
                    .append("text")
                        .attr("x", (row % 5) * widthGridCol + xScale(i))
                        .attr("y", (parseInt(col/5) + 1) * heightGridRow + padding.top * 0.25)
                        .text(`${Math.abs(i) < .1 ? "" : (i < 0 ? "R+" : "D+")}${Math.abs(i*100).toFixed(0)}%`)
                        .classed("electoral-votes-text", true)
                        .style("text-anchor", "middle")
                        .style("fill", "grey");
                
                gridHeaders
                    .append("path")
                        .attr("d", `M${(row % 5) * widthGridCol + xScale(i)},${parseInt(col/5) * heightGridRow + padding.top * 0.9} l0,${heightGridRow - padding.top * 0.8}`)
                        .classed("finish-line", true)
                        .style("opacity", .4)
                        .style("stroke-width", .5);
            };

            // Line
            gridSVG
                .append("g")
                    .attr("id", `grids-results-line-${state}`)
                    .append("path")
                        .datum(dataset)
                        .attr("d", d3.line()
                            .curve(d3.curveCatmullRom.alpha(0.5))
                            .x(d => (row % 5) * widthGridCol + xScale(d.more_democrat))
                            .y(d => parseInt(col/5) * heightGridRow + yScale(d.year))
                        )
                        .classed("electoral-states-line-grid", true);
            // Circle
            gridSVG
                .append("g")
                    .attr("id", `grids-results-circle-${state}`)
                    .selectAll("circle")
                    .data(dataset)
                    .enter()
                    .append("circle")
                        .attr("cx", d => (row % 5) * widthGridCol + xScale(d.more_democrat))
                        .attr("cy", d => parseInt(col/5) * heightGridRow +yScale(d.year))
                        .attr("r", d => rScale(d.electoral_votes))
                        .attr("class", d => d.winning_party == "democrat" ? "democrat" : "republican")
                        .classed("electoral-states-circle-grid", true);

            row++;
            col++; 

        };

        const swingStates = [
            "Arizona", 
            "Colorado", 
            "Florida", 
            "Georgia", 
            "Iowa", 
            "Michigan", 
            "Nevada", 
            "New Hampshire", 
            "New Mexico", 
            "North Carolina", 
            "Ohio", 
            "Pennsylvania",
            "Virginia", 
            "Wisconsin"
        ];

        for(state of swingStates){
            d3.select(`#grids-results-title-${state}`)
                .classed("swing-state",  true);
        };
    };

    generateScenario = () => {

        // Filter data to 2016
        let dataset = data.filter(d => d.year == 2016);

        // Scales ////////////////////////////////////////////////////////////////////////////////////

        // X Scale for popular vote
        xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.total_votes), d3.max(data, d => d.total_votes)])
            .range([padding.left*4, width - padding.right - padding.left]);
        
        // Y Scale for electoral vote
        yScale = d3.scaleLinear()
            .domain([55, 0])
            .range([padding.top, heightScenario - padding.bottom*4]);

        // Radial Scale for state's electoral votes
        rScale = d3.scaleSqrt()
            .domain([d3.min(data, d => Math.abs(d.more_democrat)), d3.max(data, d => Math.abs(d.more_democrat))])
            .range([2, 16]); // Arbitrary size


        // Axis //////////////////////////////////////////////////////////////////////////////////////

        xAxis = d3.axisBottom().scale(xScale).tickFormat(d => `${(d/1000000).toFixed(0)}M`)

        scenarioSVG
            .append("g")
                .attr("transform", `translate(${padding.left}, ${heightScenario - padding.top - padding.bottom})`)
                .classed("axis", true)
                .call(xAxis);

        yAxis = d3.axisLeft().scale(yScale);

        scenarioSVG
            .append("g")
                .attr("transform", `translate(${padding.left*5}, ${-padding.bottom*2})`)
                .classed("axis", true)
                .call(yAxis);

        let headers = scenarioSVG.append("g");

        headers
            .append("text")
                .text("Electoral Votes")
                .attr("transform", `translate(${padding.left*2}, ${heightScenario / 2}) rotate(-90)`)
                .classed("header", true);

        headers
            .append("text")
                .text("Number of Voters")
                .attr("transform", `translate(${width / 2}, ${heightScenario  - padding.bottom*3})`)
                .classed("header", true);
                
        // Tooltip ///////////////////////////////////////////////////////////////////////////////////

        circlesSVG = scenarioSVG.append("g"); // This has to come before tooltip

        tooltip = scenarioSVG.append("g").attr("id", "tooltip-scenario").classed("hidden", true);

        tooltip // need to update x, y, fill
            .append("rect")
                .attr("x", 0) 
                .attr("y", 0)
                .attr("width", tooltipWidth)
                .attr("height", tooltipHeight)
                .attr("id", "tooltip-scenario-border");
            
        tooltip // need to update x, y
            .append("rect")
                .attr("x", 0)
                .attr("y", 0) // padding.top - (tooltipHeight - border) - border
                .attr("width", tooltipWidth - border * 2)
                .attr("height", tooltipHeight - border * 2)
                .classed("textbox-fill", true)
                .attr("id", "tooltip-scenario-fill");

        tooltip // need to update text
            .append("text")
            .attr("x", 0)
            .attr("y", padding.top - tooltipHeight / 2)
            .classed("text-center", true)
            .attr("id", "tooltip-scenario-text");

        let updateStates = d => {
        
            // Update tooltip
            let tooltip = d3.select("#tooltip-scenario");
            tooltip
                .classed("hidden", false);
            tooltip.select("#tooltip-scenario-border")
                .attr("x", xScale(d.total_votes) - tooltipWidth / 2)
                .attr("y", yScale(d.electoral_votes) - padding.bottom * 2)
                .attr("class", d.winning_party);
            tooltip.select("#tooltip-scenario-fill")
                .attr("x", xScale(d.total_votes) - tooltipWidth / 2 + border)
                .attr("y", yScale(d.electoral_votes) + border - padding.bottom * 2);
            tooltip.select("#tooltip-scenario-text")
                .attr("x", xScale(d.total_votes))
                .attr("y", yScale(d.electoral_votes) + tooltipHeight / 2 - padding.bottom * 2)
                .text(d.state_po);

        };

        let unUpdateStates = () => {

            d3.select("#tooltip-scenario")
                .classed("hidden", true);

        };
        
        // Circles ///////////////////////////////////////////////////////////////////////////////////

        circlesSVG
            .attr("transform", `translate(${padding.left}, ${-padding.bottom*2})`)
            .selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
                .attr("cx", d => xScale(d.total_votes))
                .attr("cy", d => yScale(d.electoral_votes))
                .attr("r", d => rScale(Math.abs(d.more_democrat)))
                .attr("class", d => d.winning_party)
                .style("opacity", "40%")
                .on("mouseover", d => updateStates(d))
                .on("mouseout", unUpdateStates);

    };

    generateTable();
    generateGrids();
    generateScenario();

});