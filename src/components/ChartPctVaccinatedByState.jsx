import { useState, useEffect } from "react";
import * as d3 from "d3v4"
import '../assets/css/ChartPctVaccinatedByState.scss';
import cloneDeep from 'lodash/cloneDeep'

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

const ChartPctVaccinatedByState = ({rawData}) => {
  const data = cloneDeep(rawData.filter(row => (row.milestone === 0.9) && (row.code !== "WRL"))).sort((b,a) => a.days_until - b.days_until)
  const chartId = `pct-vaccinated-by-state`

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
        d.date = new Date(d.date + " 00:00:00");
    });

  // set the ranges
  var y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1);

  var x = d3.scaleLinear()
            .range([0, width]);

  // Scale the range of the data in the domains
  x.domain([0, d3.max(data, function(d){ return d.days_until * 1.1; })])
  y.domain(data.map(function(d) { return d.code; }));

  var tooltip = d3.select("body").append("div").attr("class", "tooltip");
  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "days-bar")
      //.attr("x", function(d) { return x(d.sales); })
      .attr("width", function(d) {return x(d.days_until); } )
      .attr("y", function(d) { return y(d.code); })
      .attr("height", y.bandwidth() * 0.9)
      .on("mousemove", function(d){
          tooltip
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 70 + "px")
            .style("display", "inline-block")
            .html(`${d.code}: Irá demorar ${d.days_until} dias até vacinar 90% da pop. com 1 dose`);
      })
      .on("mouseout", function(d){ tooltip.style("display", "none");});

  const minDays = d3.min(data, function(d){ return d.days_until; })
  svg.selectAll(".bar-annotations")
      .data(data)
    .enter().append("text")
      .attr("class", "annotations")
      .attr("font-size", axisFontSize)
      .attr("x", function(d) { return x(d.days_until); })
      .attr("y", function(d) { return y(d.code); })
      .attr("dy", y.bandwidth() / 2)
      .attr("dx", "0.25em")
      .style("text-anchor", "beginning")
      .style("alignment-baseline", "middle")
      .text(function(d) {
        if (d.days_until === minDays) {
          return (d.days_until).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " dias";
        } else {
          return (d.days_until).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
        }
      })

  // Add the X Axis
  svg.append("g")
      .style("font", `${axisFontSize} Bitter`)
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
              // .ticks(d3.timeYear)
              // .tickFormat(d3.timeFormat("%d/%m/%y"))
      )
      // .select(".domain").remove();

  // add the y Axis
  svg.append("g")
      .style("font", `${axisFontSize} Bitter`)
      .call(d3.axisLeft(y));

  }, [data, chartId, windowDimensions.width]);

  return (
    <div>
      <svg id={chartId}></svg>
    </div>
  )
}

export default ChartPctVaccinatedByState
