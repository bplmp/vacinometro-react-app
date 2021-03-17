import { useState, useEffect } from "react";
import * as d3 from "d3v4"
import '../assets/css/ChartDosesGivenByState.scss';
import cloneDeep from 'lodash/cloneDeep'
import moment from "moment"

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

const ChartDosesGivenByState = ({rawData}) => {
  const data = cloneDeep(rawData.filter(row => row.code !== "WRL")).sort((a,b) => a.new_first_shot_mov_avg - b.new_first_shot_mov_avg)
  const chartId = `doses-given-by-state`

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
    originalHeight = windowDimensions.width > 480 ? 700 : 900,
    width = originalWidth - margin.left - margin.right,
    height = originalHeight - margin.top - margin.bottom;

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
    });

  // set the ranges
  var y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1);

  var x = d3.scaleLinear()
            .range([0, width]);

  // Scale the range of the data in the domains
  x.domain([0, d3.max(data, function(d){ return d.new_first_shot_mov_avg * 1.15; })])
  y.domain(data.map(function(d) { return d.code; }));

  // append the rectangles for the bar chart
  var tooltip = d3.select("body").append("div").attr("class", "tooltip");
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "doses-bar")
      //.attr("x", function(d) { return x(d.sales); })
      .attr("width", function(d) {return x(d.new_first_shot_mov_avg); } )
      .attr("y", function(d) { return y(d.code); })
      .attr("height", y.bandwidth() * 0.9)
      .on("mousemove", function(d){
          tooltip
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 70 + "px")
            .style("display", "inline-block")
            .html(`${d.code}: ${(Math.round(d.new_first_shot_mov_avg * 10) / 10).toLocaleString("pt-BR")} mil<br/>primeiras doses em média por dia`);
      })
      .on("mouseout", function(d){ tooltip.style("display", "none");});

  const maxShots = d3.max(data, function(d){ return d.new_first_shot_mov_avg; })
  svg.selectAll(".bar-annotations")
      .data(data)
    .enter().append("text")
      .attr("class", "annotations")
      .attr("font-size", axisFontSize)
      .attr("x", function(d) { return x(d.new_first_shot_mov_avg); })
      .attr("y", function(d) { return y(d.code); })
      .attr("dy", y.bandwidth() / 2)
      .attr("dx", "0.25em")
      .style("text-anchor", "beginning")
      .style("alignment-baseline", "middle")
      .text(function(d) {
        if (d.new_first_shot_mov_avg === maxShots) {
          return (d.new_first_shot_mov_avg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil";
        } else {
          return (d.new_first_shot_mov_avg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
        }
      })

  // Add the X Axis
  svg.append("g")
      .style("font", `${axisFontSize} Bitter`)
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickFormat(function(d) {
            var mod = windowDimensions.width > 480 ? 10000 : 10000
            var t = d % mod
            if (t === 0) {
              return (d / 1000 + " mil")
            }
          })
              // .ticks(d3.timeYear)
              // .tickFormat(d3.timeFormat("%d/%m/%y"))
      )
      // .select(".domain").remove();

  // add the y Axis
  svg.append("g")
      .style("font", `${axisFontSize} Bitter`)
      .call(d3.axisLeft(y)
    );

  }, [data, chartId, windowDimensions.width]);

  return (
    <div>
      <svg id={chartId}></svg>
    </div>
  )
}

export default ChartDosesGivenByState
