import { useState, useEffect } from "react";
import * as d3 from "d3v4"
import '../assets/css/ChartPctVaccinated.scss';
import cloneDeep from 'lodash/cloneDeep'

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

const ChartPctVaccinated = ({rawData, stateCode}) => {
  const data = cloneDeep(rawData[stateCode])
  const chartId = `pct-vaccinated-${stateCode}`

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

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    originalWidth = 600,
    originalHeight = 400,
    width = originalWidth - margin.left - margin.right,
    height = originalHeight - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%y-%m-%d");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.coverage_first_shot); });

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
          d.date = new Date(d.date + " 00:00:00 GMT-0300");
          d.coverage_first_shot = 100 * Number(d.coverage_first_shot);
          d.milestone = 100 * Number(d.milestone);
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.date; }));
      // x.domain([d3.min(data, d => d.date), new Date("2023-06-01")]);
      y.domain([0, 100]);

      const dataReal = data.filter(row => row.projected === false)
      const dataProj = data.filter(row => row.projected === true)
      dataProj.unshift(dataReal[dataReal.length - 1])

      // Add the valueline path.
      svg.append("path")
          .data([dataReal])
          .attr("class", "line-real")
          .attr("d", valueline);

      svg.append("path")
          .data([dataProj])
          .attr("class", "line-projected")
          .attr("d", valueline);

      dataProj.splice(-1,1)

      svg.selectAll("points")
        .data(dataProj)
        .enter()
        .append("circle")
        .attr("fill", function (d) {
          if (d.milestone) {
            return "white"
          } else {
            return "black"
          }
        })
        .attr("stroke", function (d) {
          if (d.milestone) {
            return "black"
          } else {
            return "black"
          }
        })
        .attr("stroke-width", "2")
        .attr("cx", function(d) { return x(d.date) })
        .attr("cy", function(d) { return y(d.coverage_first_shot) })
        .attr("r", 5)

      if (windowDimensions.width <= 480) {
        dataProj.splice(-1,1)
      }

      svg.selectAll("annotations-date")
        .data(dataProj)
        .enter()
        .append("text")
        .attr("x", function(d) { return x(d.date) })
        .attr("y", function(d) { return y(d.coverage_first_shot) })
        .attr("dy", function (d) {
          if (d.milestone) {
            return "-1em"
          } else {
            return "-1.5em"
          }
        })
        .attr("font-size", annotationFontSize)
        .attr("text-anchor", function (d) {
          if (d.milestone) {
            return "end"
          } else {
            return "middle"
          }
        })
        .text(function (d) { return d.date.toLocaleString("pt-PT", {year: "2-digit", month: "2-digit", day: "2-digit"}).replace("/21", "") })

      svg.selectAll("annotations-value")
        .data(dataProj)
        .enter()
        .append("text")
        .attr("x", function(d) { return x(d.date) })
        .attr("y", function(d) { return y(d.coverage_first_shot) })
        .attr("dy", function (d) {
          if (d.milestone) {
            return "-2.5em"
          } else {
            return "-3em"
          }
        })
        .attr("font-size", annotationFontSize)
        .attr("text-anchor", function (d) {
          if (d.milestone) {
            return "end"
          } else {
            return "middle"
          }
        })
        .text(function (d) { return (d.milestone || d.coverage_first_shot.toFixed(1)) + "%" })

      // Add the X Axis
      svg.append("g")
          .style("font", `${axisFontSize} Bitter`)
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x)
                  .ticks(d3.timeYear)
          )
          // .select(".domain").remove();

      // https://bl.ocks.org/mbostock/4323929
      // Add the Y Axis
      svg.append("g")
          .style("font", `${axisFontSize} Bitter`)
          .call(d3.axisLeft(y)
                  .tickFormat(function(d) {
                      var mod = 50
                      var t = d % mod
                      if (t === 0) {
                        return d
                      }
                    })
        )
        // .select(".domain").remove();

      // text label for the y axis
      svg.append("text")
          .attr("y", 5)
          .attr("x", 10)
          // .attr("dy", "1em")
          .attr("font-size", annotationFontSize)
          .attr("class", "annotations")
          .style("text-anchor", "beginning")
          .text("% da população adulta vacinada");

  }, [data, chartId, windowDimensions.width]);

  return (
    <div>
      <svg id={chartId}></svg>
    </div>
  )
}

export default ChartPctVaccinated
