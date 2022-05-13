
import './App.css';
import jsonGraph from './dependency graphs/1.6.2.json';
import systemEvolution from './release data/system-evolution.json'
import ForceGraph3D from 'react-force-graph-3d';
import { useState } from 'react';
import {
  LineChart,
  ResponsiveContainer,
  Legend, Tooltip,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';



const dependencyGraph = jsonGraph;
let microservicesData = transformedData();
const rootMicroserviceId = microservicesData.nodes.find(x => x.name === "Root").id;



function getRootId(json) {
  if (json)
    return json.nodes.find(x => x.data.isRoot).data.id;
  else
    return microservicesData.nodes.find(x => x.data.isRoot).data.id;
}

function App() {

  const [showData, setShowData] = useState(false);


  return (



    <>
      <div className='header'>
        <h3>Measuring Coupling in Microservices</h3>
      </div>
      <ul className='navigation-bar'>
        <li><a>System Analysis</a></li>
        <li><a>Proposed Metrics</a></li>

      </ul>
      <div className='container'>

        <Output setShowData={setShowData} />
        <h1>Microservice Level Details</h1>
        <SystemInformation />
        <h1>Coupling Evolution</h1>
        <CouplingEvolution />

      </div>


    </>
  );
}

function Output(props) {
  return (<>
    <div className='table-graph'>
      <Table />
      <Graph />

    </div>
  </>)
}

function Graph() {



  microservicesData = [];
  microservicesData = transformedData();

  const [zoom, setZoom] = useState(5);
  return (
    <div>
      <h1>System Architecture Graph</h1>
      <div className='graph'>
        <ForceGraph3D
          graphData={microservicesData}

          width={650}
          height={450}
          minZoom={zoom}
          maxZoom={50}


          backgroundColor={"#424760"}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.2}

        />
        <button onClick={() => setZoom(zoom + 1)}>Refresh</button>
      </div></div>

  )
}
function Input(props) {
  return (<>  <div id="input">
    <p>JSON:</p>
    <input id="jsonPacket" />
    <label id="information"></label>
  </div>

    <button onClick={() => props.setShowData(true)}>Generate Graph</button></>)
}
function Table() {
  const metrics = makeCalculations();
  return (<div><h1>Results</h1> <div className="table" >

    <table className='styled-table' id="outputTable">
      <thead><td><h3>Metrics</h3></td><td><h3>Value</h3></td></thead>
      <tr><td>Total Microservices</td><td>{metrics.services}</td></tr>
      <tr><td>Number of Connections</td><td>{metrics.edges}</td></tr>
      <tr><td>SCF</td><td>{metrics.SCF}</td></tr>
      <tr><td>ADSA</td><td>{metrics.ADSA}</td></tr>
      <tr><td>Gini</td><td>{metrics.gini}</td></tr>
    </table>
  </div> </div>)
}
function SystemInformation() {
  return (<div className='styled-table'><table className='information-table'>

    <thead>
      <td><h3> Service Id</h3></td>
      <td><h3>Service Name</h3></td>
      <td><h3>ADS</h3></td>
      <td><h3>AIS</h3></td>

    </thead>
    {microservicesData.nodes.map((item =>
      <tr>
        <td key={item.id}>{item.id}</td>
        <td key={item.name}>{item.name}</td>
        <td key={item.id}>{item.ads}</td>
        <td key={item.id}>{item.ais}</td>
      </tr>
    ))}</table></div>)
}

function CouplingEvolution() {

  const evolutionJSON = systemEvolution;
  var couplingEvolution = [];

  for (let release of evolutionJSON.releases) {
    //makeCalculation is going to return an object
    couplingEvolution.push(makeCalculations(release));
  }



  return (<div><div className='styled-table'><table className='information-table'>

    <thead>
      <td><h3>Sr#</h3></td>

      <td><h3>Release Version</h3></td>
      <td><h3>Release Date</h3></td>
      <td><h3>Number of Microservices</h3></td>
      <td><h3>Number of Connections</h3></td>
      <td><h3>SCF</h3></td>
      <td><h3>ADSA</h3></td>
      <td><h3>Gini(ADS)</h3></td>


    </thead>
    {couplingEvolution.map((item, index) =>
      <tr>
        <td>{index + 1}</td>
        <td >{item.version}</td>
        <td >{item.timestamp}</td>
        <td>{item.services}</td>
        <td>{item.edges}</td>
        <td>{item.SCF}</td>
        <td>{item.ADSA}</td>
        <td>{item.gini}</td>
      </tr>
    )}</table></div>
    <h1>Coupling Evolution Graph</h1>

    <EvolutionGraph data={couplingEvolution} />
  </div>)
}

//Reference: https://www.geeksforgeeks.org/create-a-line-chart-using-recharts-in-reactjs/
function EvolutionGraph(props) {
  debugger;
  return (<div>
    <LineChartComponent data={props.data} dataKey={"ADSA"} color={"#10C169"} />
    <LineChartComponent data={props.data} dataKey={"gini"} color={"#F6C800"} />
    <LineChartComponent data={props.data} dataKey={"SCF"} color={"#00BBE4"} />





  </div>)
}

function LineChartComponent(props) {
  return (<><ResponsiveContainer className='line-chart' width="100%" aspect={3}>
    <LineChart data={props.data} margin={{ right: 300 }}>

      <XAxis dataKey="version"
        interval={'preserveStartEnd'} />
      <YAxis></YAxis>
      <Legend />
      <Tooltip />
      <Line dataKey={props.dataKey}
        stroke={props.color} activeDot={{ r: 8 }} />



    </LineChart>
  </ResponsiveContainer></>)
}




function transformedData() {


  let nodes = [];
  let links = [];
  let nodeObject;
  let edgeObject;
  const obj = makeCalculations();




  for (let edge of dependencyGraph.elements.edges) {
    edgeObject = {};
    edgeObject.source = edge.data.source;
    edgeObject.target = edge.data.target;

    links.push(edgeObject);
  }
  for (let node of dependencyGraph.elements.nodes) {
    nodeObject = {};
    //the API gateway service has no name. So we need to avoid that
    if (node.data.service)
      nodeObject.name = node.data.service;
    else
      nodeObject.name = "Root"

    nodeObject.value = 1;

    nodeObject.id = node.data.id;
    nodeObject.ads = links.filter(x => x.source === node.data.id).length;
    if (nodeObject.ads >= parseInt(obj.ADSA)) {
      nodeObject.color = "red"
    }
    else {
      nodeObject.color = "yellow"
    }
    //not inlcuding any links for the root microservice
    nodeObject.ais = links.filter(x => x.target === node.data.id && node.data.service).length;
    nodes.push(nodeObject);
  }
  return { "nodes": nodes, "links": links };

}

function calculateGini(graph) {
  let count = [];
  for (let node of graph.elements.nodes) {
    count.push(graph.elements.edges.filter(x => x.data.source === node.data.id).length);
  }





  var gini = require('gini');
  var result = gini.unordered(count).toFixed(3);

  return result;
}
function makeCalculations(json = null) {



  if (!json)
    json = dependencyGraph;

  const edges = json.elements.edges.filter(x => x["data"]["source"] !== undefined && x["data"]["source"] !== getRootId(json.elements)).length;
  const services = json.elements.nodes.filter(x => x["data"]["service"] !== undefined).length;
  const SCF = (edges / ((services * services) - services)).toFixed(2);
  const ADSA = (edges / services).toFixed(2);
  const gini = calculateGini(json);



  return { "edges": edges, "services": services, "SCF": SCF, "ADSA": ADSA, "gini": gini, "version": json.version, "timestamp": json.timestamp };

}





function getServiceNameById(id) {
  var json = JSON.parse(document.getElementById("jsonPacket").value);
  return json.elements.nodes.find(x => x["data"]["id"] === id)["data"]["service"];
}
function setPathsValue(value) {
  let textbox = document.getElementById("graphPacket");
  textbox.value = value.join(" \r\n  ");
}
export default App;
