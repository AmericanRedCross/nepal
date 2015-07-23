var width = 763;
    height = 429;

var projection = d3.geo.mercator()
    .scale(5000)
    .translate([width / 2, height / 2]);

// nepalBoundingBox is included in the fitProjection.js file
fitProjection(projection, nepalBoundingBox, [[0,0],[width, height]]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "map");

var otherGeoGroup = svg.append('g').attr("id", "geo-other");
var districtGroup = svg.append('g').attr("id", "geo-district");
var storiesGroup = svg.append('g').attr("id", "geo-stories");


function getGeo(){

    districtData  = topojson.feature(nepalData, nepalData.objects.npl_adm3).features;
    // add nepal districts to map
    districtGroup.selectAll("path")
      .data((districtData).filter(function(d){ return d.properties.NAME_3 !== "other" }))
      .enter().append("path")
      .attr("d",path)
      .attr("class", "poly-district")
    // add non-nepal landmass to map
    otherGeoGroup.selectAll("path")
      .data((districtData).filter(function(d){ return d.properties.NAME_3 == "other" }))
      .enter().append("path")
      .attr("d",path)
      .attr("class", "poly-other");

      //add points for stories to map
      d3.select("#custom-marker-pane").selectAll("div")
        .data(stories)
        .enter().append("div")
        .attr("class", function(d){return d.id})
        .classed("story-marker", true)
        .style("top", function(d){
          var top = Math.round(projection([d.lng,d.lat])[1]) - 30;
          return top + "px";
        })
        .style("left", function(d){
          var left = Math.round(projection([d.lng,d.lat])[0]) - 30;
          return left + "px";
        })
        .on("click",function(d) { clickedStory(d); })
        .on("mouseover", function(d){
          // var tooltipText = "<i>Story: " + d.title + "</i>";
          // $('#tooltip').append(tooltipText);
          d3.select(this).classed("active", true);
        })
        .on("mouseout", function(){
          //  $('#tooltip').empty();
          d3.select(this).classed("active", false);
        });

}

function clickedStory(d){
  // populate the info/story box fields
  d3.select("#info-name").text(d.name);
  d3.select("#info-title").text(d.title + ((d.org !== "") ? ', ' + d.org : ""));
  d3.select("#info-blurb").html(d.story);
  d3.select("#info-location").select('span').text(d.location);
  var imgPath = "img/pics/" + d.id + "_small.JPG";
  d3.select("#info-pic").attr("src", imgPath);
  // is there a link to a story on ifrc.org about the person?
  if(d.url == "null"){
    $("#info-more").hide();
  } else {
    $("#info-more").show();
    d3.select("#info-link-title").text(d.web);
    d3.select("#info-link").attr("href", d.url);
  }
  // show the info/story box
  $("#info").fadeIn();
  // in case the overflow box was previously scrolled down, reset it to the top
  $("#overflow-box").scrollTop(16);
}

// fires when 'X' is clicked to hide info/story box
$("#dismiss").click(function(){
  $("#info").fadeOut();
});

getGeo();
