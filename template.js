// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.PetalLength = +d.PetalLength;
    d.PetalWidth = +d.PetalWidth;
  });

  // Define the dimensions and margins for the SVG
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales for x and y axes
  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d.PetalLength) - 0.5,
      d3.max(data, (d) => d.PetalLength) + 0.5,
    ])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d.PetalWidth) - 0.5,
      d3.max(data, (d) => d.PetalWidth) + 0.5,
    ])
    .range([height, 0]);

  const colorScale = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.Species))
    .range(d3.schemeCategory10);

  // Add circles for each data point
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.PetalLength))
    .attr("cy", (d) => yScale(d.PetalWidth))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(d.Species));

  // Add x-axis label
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(5));

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Petal Length");

  // Add y-axis label
  svg.append("g").call(d3.axisLeft(yScale).ticks(5));

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .text("Petal Width");

  // Add legend
  const legend = svg
    .selectAll(".legend")
    .data(colorScale.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text((d) => d);
});

// Boxplot section
iris.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.PetalLength = +d.PetalLength;
  });

  // Define the dimensions and margins for the SVG
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create the SVG container
  const svg = d3
    .select("#boxplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales for x and y axes
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.Species))
    .range([0, width])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.PetalLength)])
    .range([height, 0]);

  // Add scales
  svg.append("g").call(d3.axisLeft(yScale));

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  // Calculate metrics for boxplot
  const rollupFunction = function (groupData) {
    const values = groupData.map((d) => d.PetalLength).sort(d3.ascending);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const iqr = q3 - q1; // Interquartile range
    return { q1, median, q3, iqr };
  };

  const quartilesBySpecies = d3.rollup(data, rollupFunction, (d) => d.Species);

  quartilesBySpecies.forEach((quartiles, species) => {
    const x = xScale(species);
    const boxWidth = xScale.bandwidth();

    // Draw vertical line for the IQR
    svg
      .append("line")
      .attr("x1", x + boxWidth / 2)
      .attr("x2", x + boxWidth / 2)
      .attr("y1", yScale(quartiles.q1 - 1.5 * quartiles.iqr))
      .attr("y2", yScale(quartiles.q3 + 1.5 * quartiles.iqr))
      .attr("stroke", "black");

    // Draw box
    svg
      .append("rect")
      .attr("x", x)
      .attr("y", yScale(quartiles.q3))
      .attr("width", boxWidth)
      .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
      .attr("fill", "lightgray");

    // Draw median line
    svg
      .append("line")
      .attr("x1", x)
      .attr("x2", x + boxWidth)
      .attr("y1", yScale(quartiles.median))
      .attr("y2", yScale(quartiles.median))
      .attr("stroke", "red")
      .attr("stroke-width", 2);
  });
});
