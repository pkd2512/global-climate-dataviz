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
            LandAndOceanAverageTemperature: +d.LandAndOceanAverageTemperature,
            season: d.season
        };
    });
    console.log(glt_data);
    drawMinMax("Monthly");
    // Redraw the chart on window resize
    wd.addEventListener("resize", function() {
        w_new = wd.innerWidth || e.clientWidth || g.clientWidth,
        h_new = wd.innerHeight|| e.clientHeight|| g.clientHeight;
        if (w_new!=w && h_new!=h) {
            w=w_new, h=h_new;
            d3.select("#cover svg").remove();
            drawMinMax("Monthly");
        }
    });
});
function minMaxChart(data, start, gap, callback) {    
    // Getting range of the max and min data
    // let tempMax = d3.max(data, function (d) {return(d.LandMaxTemperature)});
    // let tempMin = d3.min(data, function (d) {return(d.LandMinTemperature)});
    // console.log(tempMax,tempMin);
    // Drawing the semi-circular Max-Min Temperature chart
    let svgWidth = w; 
    if(!isMobile.any()) {svgWidth = w-30;} // Prevent .row overflow on desktop 
    let svgContainer = d3.select("#cover").append("svg").attr("width", svgWidth).attr("height", h);
    let xScale = d3.scaleLinear().domain([0,data.length]).range([0,180]);
    let scaleFactor = 18;
    let radius = (h/2);
    let p=1, q=1;
    // SVG groups to store the min and max bars
    let maxSvg = svgContainer.append("g").attr("transform", "translate("+svgWidth/2+","+h+")"); 
    let minSvg = svgContainer.append("g").attr("transform", "translate("+svgWidth/2+","+h+")");  
    // Plotting the Max lines   
    for(i=start; i<data.length; i+=gap) { 
        let from = -radius;
        let to = -(radius+(scaleFactor*data[i].LandMaxTemperature));
        maxSvg.append('line').classed("maxChart", true)
            .attr("transform", "rotate("+ xScale(i) +")")
            .attrs({x1: from, y1:0, x2: from, y2:0})
            .transition().duration(p*5).ease(d3.easeCubic)
            .attrs({x2: to, y2: 0});
        p++;
    }    
    // Plotting the Min lines
    for(i=start; i<data.length; i+=gap) {             
        let from = -radius;
        let to = -(radius+(scaleFactor*data[i].LandMinTemperature));        
        minSvg.append('line').classed("minChart", true)
            .attr("transform", "rotate("+ xScale(i) +")")
            .attrs({x1: from, y1:0, x2: from, y2:0})
            .transition().duration(q*5).ease(d3.easeCubic)
            .attrs({x2: to, y2: 0});  
        q++;          
    }
   // svgContainer.append("circle").attr("cx", w/2).attr("cy", h).attr("r", radius).attr("stroke", "black").attr("fill", "none");
   callback(null);
}
// Tooltip the lines
function tooltipCover(data, group, size, type, color) {
    for(i=1; i<size; i++) {
        $("#cover g:nth-child("+group+") line:nth-child("+i+")").tooltip ({
            "trigger": "hover focus",
            "template": '<div class="tooltip" role="tooltip"><div class="tooltip-inner small" style="background-color:#37474f; color:'+color+';"></div></div>',
            "container": "body",
            "placement": "auto",
            "offset": "0",
            "animation": true,
            "title": months[data[i-1].dt.getMonth()]+", "+data[i-1].dt.getFullYear()+" | "+data[i-1][type].toFixed(2)+"&degC",
            "html": true
        });
    }
}
var drawMinMax = function(season) {
    let minMax_Data = glt_data;
    if (season != "Monthly") { minMax_Data = glt_data.filter(function(d){ return d.season === season}); } d3.select("#cover svg").remove();       
    let delay = minMax_Data.length*3.5;
    d3.queue()
        .defer(minMaxChart,minMax_Data,0,1)
        .await(function(error) {
            if (error) console.log(error);            
            setTimeout(function() {
                tooltipCover(minMax_Data,1,($("#cover g:nth-child(1) line").length),"LandMaxTemperature","#fdbb2d");
                tooltipCover(minMax_Data,2,($("#cover g:nth-child(2) line").length),"LandMinTemperature","#22c1c3");   
                console.log("tooltipCover added!");              
            }, delay);              
          });
}
// Checking mobile browser
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};    