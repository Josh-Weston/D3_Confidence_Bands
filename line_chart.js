// This is super dirt, but quick.
// This can be refactored

d3.csv('./export_results.csv').then(buildChart);

function buildChart(data) {

    data = data.filter(el => el['Index'] != '1');
    console.log(data);
    let margin = {top: 70, right: 20, bottom: 30, left: 40};
    let height = 550 - margin.top - margin.bottom;
    let width = 800 - margin.right - margin.left;

    const svg = d3.select("#chart");
    let chart = svg.append('g')
                .attr('id', 'chart-body')
                .attr('transform', `translate(${margin.left + 10}, ${margin.top})`);

    // Enforce 0 axis
    let xAxisScaleZero = d3.scalePoint().domain(data.map(d => d['Date'])).range([1, width]);
    let yAxisScaleZero = d3.scaleLinear().domain([18, 32]).range([height, 0]).clamp(true);

    let yAxis = d3.axisLeft().scale(yAxisScaleZero);

    chart.append('g') 
        .attr('id', 'yAxisG')
        .attr('class', 'axis')
        .lower()
        .call(yAxis);

    let xAxis = d3.axisBottom().scale(xAxisScaleZero);

    chart.append('g') 
        .attr('id', 'xAxisG')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .attr('dy', '0px')
        .attr('dx','-35px')
        .attr("transform", "rotate(-65)");

    let areaPath80 = d3.area()
        .x(d => xAxisScaleZero(d['Date']))
        .y0(d => yAxisScaleZero(d['upper.80']))
        .y1(d => yAxisScaleZero(d['lower.80']))
        .curve(d3.curveCardinal);

    chart.append('path')
        .datum(data)
        .attr('id', '80')
        .attr('d', areaPath80)
        .attr('fill', '#dce6f2');

    let areaPath95 = d3.area()
        .x(d => xAxisScaleZero(d['Date']))
        .y0(d => yAxisScaleZero(d['upper.95']))
        .y1(d => yAxisScaleZero(d['lower.95']))
        .curve(d3.curveCardinal);

    chart.append('path')
        .datum(data)
        .attr('id', '95')
        .attr('d', areaPath95)
        .lower()
        .attr('fill', '#ebebeb');
    
    let predictLine = d3.line()
        .x(d => xAxisScaleZero(d['Date']))
        .y(d => yAxisScaleZero(d['point.forecast']))
        .curve(d3.curveCardinal);

    chart.append('path')
        .datum(data)
        .attr('id', 'line-points')
        .attr('class', 'line')
        .attr('stroke', '#4a7ebb')
        .attr('stroke-width', '2px')
        .attr('fill', 'none')
        .attr('d', predictLine);

    let circles = chart.append('g');
    
    circles.selectAll('circle')
        .data(data)
        .enter()
            .append('circle')
            .attr('r', 5)
            .attr('cx', d => xAxisScaleZero(d['Date']))
            .attr('cy', d => yAxisScaleZero(d['point.forecast']))
            .attr('stroke', 'gray')
            .attr('fill', 'white');


    // Add Legend
    let legendsObj = [{measure: 'Forecast'}, {measure: '80%'}, {measure: '95%'}];
    let legend = svg.append('g')
                    .attr('transform', 'translate(50, 20)');

    let legends = legend.selectAll('g')
                        .data(legendsObj)
                        .enter()
                            .append('g')
                            .attr('transform', (d, i) => `translate(${i * 135}, 20)`);


    let colorRange = d3.scaleOrdinal().domain(legendsObj.map(d => d.measure)).range(['#4a7ebb', '#dce6f2', '#ebebeb']);

    legends.append('rect')
            .attr('width', 40)
            .attr('height', 5)
            .attr('fill', d => colorRange(d.measure));

    legends.append('text')
            .attr('x', 50)
            .attr('y', 9)
            .text(d => d.measure)
            .style('fill', 'black').style('font-size', '12px')


    let upperLine80 = d3.line()
        .x(d => xAxisScaleZero(d['Date']))
        .y(d => yAxisScaleZero(d['upper.80']))
        .curve(d3.curveCardinal);

    chart.append('path')
        .datum(data)
        .attr('id', 'line-dashed-upper80')
        .attr('class', 'line')
        .attr('stroke', '#4a7ebb')
        .attr('stroke-width', '1px')
        .attr('stroke-dasharray', 4)
        .attr('fill', 'none')
        .attr('d', upperLine80);

    let lowerLine80 = d3.line()
        .x(d => xAxisScaleZero(d['Date']))
        .y(d => yAxisScaleZero(d['lower.80']))
        .curve(d3.curveCardinal);

    chart.append('path')
        .datum(data)
        .attr('id', 'line-dashed-lower80')
        .attr('class', 'line')
        .attr('stroke', '#4a7ebb')
        .attr('stroke-width', '1px')
        .attr('stroke-dasharray', 4)
        .attr('fill', 'none')
        .attr('d', lowerLine80);

    let lowerLine95 = d3.line()
        .x(d => xAxisScaleZero(d['Date']))
        .y(d => yAxisScaleZero(d['lower.95']))
        .curve(d3.curveCardinal);

    chart.append('path')
        .datum(data)
        .attr('id', 'line-dashed-lower95')
        .attr('class', 'line')
        .attr('stroke', 'gray')
        .attr('stroke-width', '1px')
        .attr('stroke-dasharray', 4)
        .attr('fill', 'none')
        .attr('d', lowerLine95);

    let upperLine95 = d3.line()
        .x(d => xAxisScaleZero(d['Date']))
        .y(d => yAxisScaleZero(d['upper.95']))
        .curve(d3.curveCardinal);

    chart.append('path')
        .datum(data)
        .attr('id', 'line-dashed-upper95')
        .attr('class', 'line')
        .attr('stroke', 'gray')
        .attr('stroke-width', '1px')
        .attr('stroke-dasharray', 4)
        .attr('fill', 'none')
        .attr('d', upperLine95);


    circles.selectAll('text')
        .data(data)
        .enter()
            .append('text')
            .attr('x', d => xAxisScaleZero(d['Date']))
            .attr('y', d => yAxisScaleZero(d['point.forecast']) + 20)
            .text(d => Number(d['point.forecast']).toFixed(2))
            .style('fill', 'black').style('font-size', '12px')

}