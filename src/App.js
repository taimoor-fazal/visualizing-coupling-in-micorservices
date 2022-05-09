
import './App.css';
import jsonGraph from './dependency graphs/1.6.2.json';
import ForceGraph3D from 'react-force-graph-2d';
import { useState } from 'react';

const dependencyGraph = jsonGraph;
let microservicesData = transformedData();
const rootMicroserviceId = microservicesData.nodes.find(x => x.name === "Root").id;

function dummyData() {
  let json = {
    "nodes": [
      {
        "id": "id1",
        "name": "name1",
        "val": 1
      },
      {
        "id": "id2",
        "name": "name2",
        "val": 10
      },
      {
        "id": "id3",
        "name": "name3",
        "val": 50
      },
      {
        "id": "id4",
        "name": "name4",
        "val": 30
      },
      {
        "id": "id5",
        "name": "name5",
        "val": 13
      },

    ],
    "links": [
      {
        "source": "id1",
        "target": "id2"
      },
      {
        "source": "id2",
        "target": "id3"
      }, {
        "source": "id2",
        "target": "id4"
      }, {
        "source": "id3",
        "target": "id5"
      },
      {
        "source": "id3",
        "target": "id1"
      },
      {
        "source": "id1",
        "target": "id5"
      }



    ]
  };
  return json;


}
function transformedData() {

  let nodes = [];
  let links = [];
  let nodeObject;
  let edgeObject;




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
    //not inlcuding any links for the root microservice
    nodeObject.ais = links.filter(x => x.target === node.data.id && node.data.service).length;
    nodes.push(nodeObject);
  }
  console.log(nodes);
  return { "nodes": nodes, "links": links };

}

// function genRandomTree(N = 300, reverse = false) {
//   return {
//     nodes: [...Array(N).keys()].map(i => ({ id: i })),
//     links: [...Array(N).keys()]
//       .filter(id => id)
//       .map(id => ({
//         [reverse ? 'target' : 'source']: id,
//         [reverse ? 'source' : 'target']: Math.round(Math.random() * (id - 1))
//       }))
//   };
// }
function App() {
  console.log(dependencyGraph);
  const [showData, setShowData] = useState(false);
  // let myData = {
  //   "nodes": [
  //     {
  //       "id": "id1",
  //       "name": "name1",
  //       "val": 100
  //     },
  //     {
  //       "id": "id2",
  //       "name": "name2",
  //       "val": 10
  //     }

  //   ],
  //   "links": [
  //     {
  //       "source": "id1",
  //       "target": "id2"
  //     }
  //   ]
  // }

  return (



    <>
      <div className='header'>
        <h2>Measuring Coupling in Microservices</h2>
      </div>
      <div className='container'>

        <Output setShowData={setShowData} />
        <h1>Microservice Level Details</h1>
        <SystemInformation />
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
  console.log("Graph");
  console.log(microservicesData);
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
          linkCurvature={0.25}

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
  const [edges, services, SCF, ADSA, gini] = makeCalculations();
  return (<div><h1>Results</h1> <div className="table" >

    <table className='styled-table' id="outputTable">
      <thead><td><h3>Metrics</h3></td><td><h3>Value</h3></td></thead>
      <tr><td>Total Microservices</td><td>{services}</td></tr>
      <tr><td>Number of Connections</td><td>{edges}</td></tr>
      <tr><td>SCF</td><td>{SCF}</td></tr>
      <tr><td>ADSA</td><td>{ADSA}</td></tr>
      <tr><td>Gini</td><td>{gini}</td></tr>
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
function makeCalculations() {


  var json = dependencyGraph;
  const edges = json.elements.edges.filter(x => x["data"]["source"] !== undefined && x["data"]["source"] !== rootMicroserviceId).length;
  const services = json.elements.nodes.filter(x => x["data"]["service"] !== undefined).length;
  const SCF = (edges / ((services * services) - services)).toFixed(2);
  const ADSA = (edges / services).toFixed(2);
  const gini = calculateGini(json);

  return [edges, services, SCF, ADSA, gini];

}


function generateGraph() {
  var json = JSON.parse(document.getElementById("jsonPacket").value);
  let input = document.getElementById("input");

  input.style.display = "none";

  let paths = [];
  for (let edge of json.elements.edges) {
    let source = getServiceNameById(edge.data.source);

    if (source === undefined) {

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
export default App;
