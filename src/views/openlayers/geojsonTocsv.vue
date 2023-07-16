<template>
  <div>
    <div class="info">
      Convert GeoJSON file into CSV (Comma Separated Values).
      <br />
      If the file only contains points features a lon and lat column is added.
      Otherwise a type column is added with a coord column that contains all the
      coordinates filed as JSON array.
    </div>

    <div class="globe">
      <i class="fa fa-globe"></i><i class="fa fa-arrow-circle-right"></i
      ><i class="fa fa-file-excel-o"></i>
    </div>

    <div id="dropfile">Drag & drop GeoJSON file to convert.</div>

    <div class="info">
      <p>Options:</p>
      <ul style="list-style: none">
        <li>
          Encoding:
          <input
            id="encode"
            value="UTF-8"
            style="width: 5em; padding: 0.1em 0.5em"
          />
        </li>
      </ul>

      <p style="margin-bottom: 0">Result:</p>
      <div id="pbar"><div></div></div>
      <div class="loading"></div>

      <div id="map"></div>

      <textarea id="result"></textarea>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {};
  },
  methods: {

  },
  mounted() {
    var name, result;

    $(document).on("dragover dragleave", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.type == "dragover") $("#dropfile").addClass("hover");
      else $("#dropfile").removeClass("hover");
      return false;
    });

    $(document).on("drop", function (e) {
      if (e.originalEvent.dataTransfer) {
        if (e.originalEvent.dataTransfer.files.length) {
          // Stop the propagation of the event
          e.preventDefault();
          e.stopPropagation();
          $("#dropfile").removeClass("hover");
          $(".loading").html(" loading...");
          // Main function to upload
          var file = e.originalEvent.dataTransfer.files[0];
          name = file.name;
          var reader = new FileReader();
          reader.onload = function (event) {
            console.log(reader);
            var features;
            try {
              features = JSON.parse(reader.result).features;
            } catch (e) {
              $(".loading").html('<span class="warn">No valid file...</span>');
              return;
            }
            var csv = [];
            var header = {};
            var n = 0;
            var isPt = true;
            features.forEach(function (f) {
              if (f && f.geometry) {
                for (var p in f.properties) {
                  if (header[p] === undefined) {
                    header[p] = n++;
                  }
                }
                if (f.geometry.type !== "Point") isPt = false;
              }
            });
            features.forEach(function (f) {
              if (f && f.geometry) {
                var row = [];
                for (var p in header) {
                  var r = (row[header[p]] = f.properties[p]);
                  if (String(r) === "[object Object]")
                    row[header[p]] = JSON.stringify(f.properties[p]);
                }
                if (isPt) {
                  row.push(f.geometry.coordinates[0]);
                  row.push(f.geometry.coordinates[1]);
                } else {
                  row.push(f.geometry.type);
                  row.push(JSON.stringify(f.geometry.coordinates));
                }
                csv.push(row);
              }
            });
            var cols = [];
            for (var p in header) {
              cols.push(p);
            }
            if (isPt) {
              cols.push("lon");
              cols.push("lat");
            } else {
              cols.push("type");
              cols.push("coord");
            }
            csv.unshift(cols);
            result = Papa.unparse(csv);
            $("#result").val(
              result.substr(0, 50000) + (result.length > 50000 ? "\n..." : "")
            );
            $(".loading").html(" " + features.length + " feature(s) loaded.");
            $("#pbar > div").width(0);
            $("button").show();
          };
          reader.readAsText(file, $("#encode").val());
        }
      } else $(this).css("border", "3px dashed #BBBBBB");
      return false;
    });
  },
};
</script>
 <style scoped lang="less">
@import "./style.css";
body {
  max-width: 800px;
  margin: 0.5em auto;
  background: #ddc;
  font-family: "Open Sans Condensed", Arial, Helvetica, Verdana, sans-serif;
  color: #775;
}
h1 {
  background: #886;
}
h1 .fa {
  color: #fff;
  font-size: 1.8em;
  vertical-align: middle;
}
.info {
  padding: 1em 2em;
  background: #fff;
  border-radius: 6px;
  clear: both;
}
.globe {
  text-align: center;
  float: left;
  font-size: 5em;
  width: 40%;
}
.globe .fa {
  vertical-align: middle;
  margin: 0 5px;
  color: #664;
}
.globe .fa-file-excel-o {
  font-size: 0.75em;
}
.globe .fa-arrow-circle-right {
  font-size: 0.5em;
}

#dropfile {
  font-size: 1.2em;
  width: 55%;
  float: right;
  border: 3px dashed #997;
  padding: 1em 3.5em;
  text-align: center;
  box-sizing: border-box;
  margin: 0 3em 1em -3em;
  font-weight: bold;
}
#dropfile.hover {
  border-color: #664;
  background: #e6e6d6;
}

#pbar {
  display: none;
  width: 200px;
  border: 1px solid #664;
  margin: 0.5em;
  float: left;
}
#pbar > div {
  height: 15px;
  width: 0;
  background: #664;
}
textarea {
  width: 100%;
  height: 15em;
  box-sizing: border-box;
  white-space: nowrap;
  min-width: 100%;
  max-width: 100%;
}
.loading {
  margin: 0 0 1em;
  padding: 0.5em;
  height: 1em;
}
.info > button {
  float: right;
  background: #887;
  color: #fff;
  border: 0;
  margin: 0 2em;
  font-size: 1.3em;
  font-weight: bold;
  padding: 0.25em 1em;
  display: none;
  cursor: pointer;
}
.info > button i {
  color: #fff;
}
#map {
  display: none;
  float: none;
  width: 100%;
  height: 400px;
}
.warn {
  background: #fe0;
  color: #800;
  padding: 0 1em;
}
</style>
  