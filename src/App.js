
import './App.css';


function App() {
  return (
    <body>
      <div className='container'>
        <h2>Measuring Coupling in Microservices</h2>
        <div id="input">
          <p>JSON:</p>
          <input id="jsonPacket" />
          <label id="information"></label>
        </div>

        <button onClick={() => generateGraph()}>Generate Graph</button>
        <div>
          <p>Generated Graph:</p>
          <textarea id="graphPacket" >
          </textarea>

        </div>
        <div id="output" >
          <table className='styled-table' id="outputTable">

          </table>
        </div></div></body>
  );
}


function makeCalculations() {
  let output = document.getElementById("output");
  output.style.display = "block";
  let table = document.getElementById("outputTable");

  var header = table.createTHead();


  var row = header.insertRow(0);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);


  cell1.innerHTML = "<b>Metric</b>";
  cell2.innerHTML = "<b>Value</b>";




  var json = JSON.parse(document.getElementById("jsonPacket").value);
  const edges = json.elements.edges.filter(x => x["data"]["source"] !== undefined).length;
  const services = json.elements.nodes.filter(x => x["data"]["service"] !== undefined).length;
  const SCF = (edges / ((services * services) - services)).toFixed(2);
  const ADSA = (edges / services).toFixed(2);
  const gini = calculateGini(json);




  row = table.insertRow(1);
  cell1 = row.insertCell(0);
  cell2 = row.insertCell(1);


  cell1.innerHTML = "Number of Microservices";
  cell2.innerHTML = services;

  row = table.insertRow(2);
  cell1 = row.insertCell(0);
  cell2 = row.insertCell(1);
  cell1.innerHTML = "Sum of calls";
  cell2.innerHTML = edges;



  row = table.insertRow(3);
  cell1 = row.insertCell(0);
  cell2 = row.insertCell(1);
  cell1.innerHTML = "Service Connectivity Factor(SCF)";
  cell2.innerHTML = SCF;



  row = table.insertRow(4);
  cell1 = row.insertCell(0);
  cell2 = row.insertCell(1);
  cell1.innerHTML = "ADSA";
  cell2.innerHTML = ADSA;

  row = table.insertRow(5);
  cell1 = row.insertCell(0);
  cell2 = row.insertCell(1);
  cell1.innerHTML = "Gini (ADS)";
  cell2.innerHTML = gini;

}


function generateGraph() {
  var json = JSON.parse(document.getElementById("jsonPacket").value);
  let input = document.getElementById("input");

  input.style.display = "none";

  let paths = [];
  for (let edge of json.elements.edges) {
    let source = getServiceNameById(edge.data.source);

    if (source === undefined) {
      debugger;
    }
    // eslint-disable-next-line no-useless-concat
    paths.push("\"" + getServiceNameById(edge.data.source) + "\"" + " -> " + "\"" + getServiceNameById(edge.data.target) + "\"");
  }
  console.log(paths);
  setPathsValue(paths);
  makeCalculations();
}
function getServiceNameById(id) {
  var json = JSON.parse(document.getElementById("jsonPacket").value);
  return json.elements.nodes.find(x => x["data"]["id"] === id)["data"]["service"];
}
function setPathsValue(value) {
  let textbox = document.getElementById("graphPacket");
  textbox.value = value.join(" \r\n  ");
}


// function calculateADS(graph) {
//   let count = 0;
//   debugger;
//   for (let node of graph.elements.nodes) {
//     count += graph.elements.edges.filter(x => x.data.source == node.data.id).length;
//   }
//   alert(count);
//   return count;

// }
// function calculateAIS(graph) {
//   let count = 0;
//   for (let node of graph.elements.nodes) {
//     count += graph.elements.edges.filter(x => x.data.target == node.data.id).length;
//   }
//   alert(count);
//   return count;
// }

function calculateGini(graph) {
  let count = [];
  for (let node of graph.elements.nodes) {
    count.push(graph.elements.edges.filter(x => x.data.source === node.data.id).length);
  }





  var gini = require('gini');
  var result = gini.unordered(count).toFixed(3);

  return result;
}

export default App;
