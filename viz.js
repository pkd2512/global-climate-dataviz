var wd = window,
d = document,
e = d.documentElement,
g = d.getElementsByTagName('body')[0],
w = wd.innerWidth || e.clientWidth || g.clientWidth,
h = wd.innerHeight|| e.clientHeight|| g.clientHeight;
var aspect = (w/h)/(1920/1080);
console.log("aspect "+aspect);
var glt_data;
var parseDate = d3.timeParse("%Y-%m-%d");
var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
d3.csv('data/glt.csv', function(error, data) {
    if (error) {
        alert("File Not Found: data/glt.csv");
    }
    // Storing the data in a global variable
    // Converting data to dates and numbers from CSV strings
    glt_data = data.map(function (d){
        return {
            dt: parseDate(d.dt),
            LandAverageTemperature: +d.LandAverageTemperature,
            LandMaxTemperature: +d.LandMaxTemperature,
            LandMinTemperature: +d.LandMinTemperature,
            LandAndOceanAverageTemperature: +d.LandAndOceanAverageTemperature
        };
    });
    console.log(glt_data);
    d3.queue()
        .defer(minMaxChart,glt_data,0,1)
        .await(function(error) {
            if (error) console.log(error);            
            setTimeout(function() {
                tooltipCover(1,($("#cover g:nth-child(1) line").length),"LandMaxTemperature","#fdbb2d");
                tooltipCover(2,($("#cover g:nth-child(2) line").length),"LandMinTemperature","#22c1c3");   
                console.log("tooltipCover added!");              
            }, 7500);              
          });
    // Redraw the chart on window resize
    wd.addEventListener("resize", function() {
        d3.select("#cover svg").remove();
        w = wd.innerWidth || e.clientWidth || g.clientWidth,
        h = wd.innerHeight|| e.clientHeight|| g.clientHeight;
        d3.queue()
        .defer(minMaxChart,glt_data,0,1)
        .await(function(error) {
            if (error) console.log(error);            
            setTimeout(function() {
                tooltipCover(1,($("#cover g:nth-child(1) line").length),"LandMaxTemperature","#fdbb2d");
                tooltipCover(2,($("#cover g:nth-child(2) line").length),"LandMinTemperature","#22c1c3");   
                console.log("tooltipCover added!");              
            }, 7500);              
          });
        console.log("resized");
    });
});
function minMaxChart(data, start, gap, callback) {    
    // Getting range of the max and min data
    // let tempMax = d3.max(data, function (d) {return(d.LandMaxTemperature)});
    // let tempMin = d3.min(data, function (d) {return(d.LandMinTemperature)});
    // console.log(tempMax,tempMin);
    // Drawing the semi-circular Max-Min Temperature chart
    let svgContainer = d3.select("#cover").append("svg").attr("width", w).attr("height", h);
    let xScale = d3.scaleLinear().domain([0,glt_data.length]).range([0,180]);
    let scaleFactor = 18;
    let radius = (h/2);
    let p=1, q=1, t=0;
    // SVG groups to store the min and max bars
    svgContainer.append("g").attr("transform", "translate("+w/2+","+h+")"); 
    svgContainer.append("g").attr("transform", "translate("+w/2+","+h+")");  
    // Plotting the Max lines   
    for(i=start; i<glt_data.length; i+=gap) { 
        let from = -radius;
        let to = -(radius+(scaleFactor*glt_data[i].LandMaxTemperature));
        svgContainer.select("g:nth-child(1)").append('line').classed("maxChart", true)
            .attr("transform", "rotate("+ xScale(i) +")")
            .attrs({x1: from, y1:0, x2: from, y2:0})
            .transition().duration(p*5).ease(d3.easeCubic)
            .attrs({x2: to, y2: 0});
        p++;
    }    
    // Plotting the Min lines
    for(i=start; i<glt_data.length; i+=gap) {             
        let from = -radius;
        let to = -(radius+(scaleFactor*glt_data[i].LandMinTemperature));        
        svgContainer.select("g:nth-child(2)").append('line').classed("minChart", true)
            .attr("transform", "rotate("+ xScale(i) +")")
            .attrs({x1: from, y1:0, x2: from, y2:0})
            .transition().duration(q*5).ease(d3.easeCubic)
            .attrs({x2: to, y2: 0});  
        t+=q*5;
        q++;          
    }
   // svgContainer.append("circle").attr("cx", w/2).attr("cy", h).attr("r", radius).attr("stroke", "black").attr("fill", "none");
   callback(null);
}
// Tooltip the lines
function tooltipCover(group, size, type, color) {
    for(i=1; i<size; i++) {
        $("#cover g:nth-child("+group+") line:nth-child("+i+")").tooltip ({
            "trigger": "hover focus",
            "template": '<div class="tooltip" role="tooltip"><div class="tooltip-inner small" style="background-color:#37474f; color:'+color+';"></div></div>',
            "container": "body",
            "placement": "auto",
            "offset": "0",
            "animation": true,
            "title": months[glt_data[i-1].dt.getMonth()]+", "+glt_data[i-1].dt.getFullYear()+" | "+glt_data[i-1][type].toFixed(2)+"&degC",
            "html": true
        });
    }
}
    