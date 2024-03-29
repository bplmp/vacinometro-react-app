import { useState, useEffect } from "react";
import * as d3 from "d3v4"
import '../assets/css/ChartDosesGiven.scss';
import cloneDeep from 'lodash/cloneDeep'
import moment from "moment"

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

const ChartDosesGiven = ({rawData, stateCode, shotColMa, shotCol}) => {
  // console.log(data)
  const data = cloneDeep(rawData[stateCode].filter(row => row.projected === false))
  const chartId = `doses-${stateCode}-${shotCol}`

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const annotationFontSize = windowDimensions.width > 480 ? "1em" : "1.5em"
    const axisFontSize = windowDimensions.width > 480 ? "0.8em" : "1.3em"

    var margin = {top: 20, right: 20, bottom: 30, left: 70},
    originalWidth = 600,
    originalHeight = 400,
    width = originalWidth - margin.left - margin.right,
    height = originalHeight - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%y-%m-%d");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin

    d3.select("#" + chartId).selectAll("*").remove()

    var svg = d3.select("#" + chartId)
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${originalWidth} ${originalHeight}`)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");


      // format the data
      data.forEach(function(d) {
          // d.date = parseTime(d.date);
          d.date = moment(d.date);
          d[shotCol] = Number(d[shotCol]) / 1000;
          d[shotColMa] = Number(d[shotColMa]) / 1000;
          d.milestone = 100 * Number(d.milestone);
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain([0, d3.max(data, d => d[shotCol] * 1.05)]);

      var tooltip = d3.select("body").append("div").attr("class", "tooltip");
      const barWidth = width / data.length
      svg.selectAll(".bar")
            .data(data)
          .enter().append("rect")
            .attr("class", function (d) {
              if (d.outlier) {
                return "doses-bar-outlier"
              } else {
                return "doses-bar"
              }
            })
            .attr("x", function(d) { return x(d.date) - barWidth; })
            .attr("width", barWidth)
            .attr("y", function(d) { return y(d[shotCol]); })
            .attr("height", function(d) { return height - y(d[shotCol]); })
            .on("mousemove", function(d){
                tooltip
                  .style("left", d3.event.pageX - 50 + "px")
                  .style("top", d3.event.pageY - 70 + "px")
                  .style("display", "inline-block")
                  .html((d.date.format("DD/MM/YY")) + "<br/>" + Math.round(d[shotCol] * 1000).toLocaleString("pt-BR") + " doses aplicadas");
            })
        		.on("mouseout", function(d){ tooltip.style("display", "none");});
      // Add the valueline path
      // define the line
      var valueline = d3.line()
          .curve(d3.curveStep)
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d[shotColMa]); });
      const dataLine = data.filter(row => row[shotColMa] > 0)
      svg.append("path")
          .data([dataLine])
          .attr("class", "line-avg")
          .attr("d", valueline);

      const lastAvgPoint = [dataLine[dataLine.length - 1]]
      // annotation line
      svg.append('line')
          .style("stroke", "#bbbbbb")
          .style("stroke-width", 2)
          .attr("x1", function(d) { return x(lastAvgPoint[0].date) })
          .attr("y1", "2.5em")
          .attr("x2", function(d) { return x(lastAvgPoint[0].date) })
          .attr("y2", function(d) { return y(lastAvgPoint[0][shotColMa]) })

      svg.selectAll("points")
        .data(lastAvgPoint)
        .enter()
        .append("circle")
        .attr("fill", "black")
        .attr("stroke", "black")
        .attr("stroke-width", "0")
        .attr("cx", function(d) { return x(d.date) })
        .attr("cy", function(d) { return y(d[shotColMa]) })
        .attr("r", 5)

    svg.selectAll("points-annotation")
      .data(lastAvgPoint)
      .enter()
      .append("text")
      .attr("x", function(d) { return x(d.date) })
      .attr("y", function(d) { return y(d[shotColMa]) * 0 })
      .attr("dy", "0")
      .attr("class", "annotations")
      .attr("font-size", annotationFontSize)
      .attr("text-anchor", "end")
      .text(function (d) { return (Math.round(d[shotColMa] * 10) / 10).toLocaleString("pt-BR") + " mil doses"})
    svg.selectAll("points-annotation-avg")
      .data(lastAvgPoint)
      .enter()
      .append("text")
      .attr("x", function(d) { return x(d.date) })
      .attr("y", function(d) { return y(d[shotColMa]) * 0 })
      .attr("dy", "1.5em")
      .attr("class", "annotations")
      .attr("font-size", annotationFontSize)
      .attr("text-anchor", "end")
      .text("em média por dia")



      // https://bl.ocks.org/mbostock/4323929
      // Add the Y Axis
      svg.append("g")
          .style("font", `${axisFontSize} Bitter`)
          .call(d3.axisLeft(y)
                  // .tickFormat(function(d) {
                  //     var mod = windowDimensions.width > 480 ? 50 : 200
                  //     var t = d % mod
                  //     if (t === 0) {
                  //       return d
                  //     }
                  //   })
                  .ticks(5)
        )
        // .select(".domain").remove();

      // // text label for the y axis
      // if (windowDimensions.width > 480) {
      //   svg.append("text")
      //       .attr("y", 5)
      //       .attr("x", 10)
      //       // .attr("dy", "1em")
      //       .attr("font-size", annotationFontSize)
      //       .attr("class", "annotations")
      //       .style("text-anchor", "beginning")
      //       .text("mil primeiras doses aplicadas");
      // }

      // Add the X Axis
      d3.json("https://cdn.jsdelivr.net/npm/d3-time-format@3/locale/pt-BR.json", function(error, locale) {
        if (error) throw error;
        d3.timeFormatDefaultLocale(locale);
        svg.append("g")
          .style("font", `${axisFontSize} Bitter`)
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x)
          .ticks(d3.timeMonth, 1)
          .tickFormat(d3.timeFormat("%b"))
        )
        // .select(".domain").remove();
      });

  }, [data, chartId, windowDimensions.width]);

  return (
    <div>
      <svg id={chartId}></svg>
    </div>
  )
}

export default ChartDosesGiven
