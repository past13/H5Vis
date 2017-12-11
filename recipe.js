var $recipe = {};


var projector;

function setStatus(text) {
  var statusLabel = document.getElementById('statusLabel');
  statusLabel.innerHTML = '<p>'+text+'</p>';
}

function loadContainerType(node) {
  var result = {};
  result.id = node.attr('id');
  result.code = node.attr('code');
  result.type = node.attr('type');
  result.cl = node.find('contentsize').attr('length');
  result.cw = node.find('contentsize').attr('width');
  result.ch = node.find('contentsize').attr('height');
  result.pl = node.find('physicalsize').attr('length');
  result.pw = node.find('physicalsize').attr('width');
  result.ph = node.find('physicalsize').attr('height');
  result.ol = node.find('contentoffset').attr('deltax');
  result.ow = node.find('contentoffset').attr('deltay');
  result.oh = node.find('contentoffset').attr('deltaz');
  result.maxcontentweight = node.find('maxcontentweight');
  return result;
}

function loadOrderline(node) {
  var result = {};
  result.productcode = node.attr('productcode');
  if (node.attr('id')) result.id = node.attr('id');
  else result.id = result.productcode;
  result.contentcode = node.attr('contentcode');
  result.contentamount = node.attr('contentamount');
  result.orderamount = node.attr('orderamount');
  result.name = node.find('name').text();
  result.description = node.find('description').text();
  result.length = node.find('size').attr('length');
  result.width = node.find('size').attr('width');
  result.height = node.find('size').attr('height');
  result.weight = node.find('weight').text();
  result.stackingclass = node.find('stackinginfo').attr('stackingclass');
  result.mwot = node.find('stackinginfo').attr('maxweightontop');
  return result;
}

function loadOrder(node) {
  var order = {};
  order.xml = node.text();
  order.code = node.attr('code');
  order.modules = node.find('orderinfo > modules').text();
  order.parameterlist = {};
  node.find('parameterlist > parameter').each(function() {
    order.parameterlist[ $(this).attr('name') ] = $(this).attr('value');
  });
  order.containertypelist = {};
  node.find('containertypelist > containertype').each(function() {
    var ct = loadContainerType( $(this) );
    order.containertypelist[ ct.code ] = ct;
  });

  // used to generate unique colors
	var GOLDEN_RATIO_CONJUGATE = 0.618033988749895;
	var _h = 0;
	var _v = 0;

  order.orderlinelist = {};
  node.find('orderlinelist > orderline').each(function() {
    var ol = loadOrderline( $(this) );
    order.orderlinelist[ ol.id ] = ol;

    // generate unique color for each orderline
    ol.color = new THREE.Color();
    ol.color.setHSL(_h, 1.00, 0.50 + 0.30 * _v);
    _h = (_h + GOLDEN_RATIO_CONJUGATE) % 1;
    _v = (_v + GOLDEN_RATIO_CONJUGATE) % 1;
  });

  return order;
}

function loadPackage(node) {
  var pack = {};
  pack.index = node.attr('index');
  pack.productcode = node.attr('productcode');
  pack.orderlineid = node.attr('orderlineid');
  if (!pack.orderlineid || pack.orderlineid == '0') pack.orderlineid = pack.productcode;
  pack.minx = node.find('position').attr('x');
  pack.miny = node.find('position').attr('y');
  pack.minz = node.find('position').attr('z');
  pack.maxx = node.find('extent').attr('x');
  pack.maxy = node.find('extent').attr('y');
  pack.maxz = node.find('extent').attr('z');
  pack.x = (parseInt(pack.minx) + parseInt(pack.maxx))/2;
  pack.y = (parseInt(pack.miny) + parseInt(pack.maxy))/2;
  pack.z = (parseInt(pack.minz) + parseInt(pack.maxz))/2;
  pack.rotx = node.find('rotation').attr('x') * (Math.PI/180);
  pack.roty = node.find('rotation').attr('y') * (Math.PI/180);
  pack.rotz = node.find('rotation').attr('z') * (Math.PI/180);
  pack.remwot = node.find('statistics').attr('remainingweightontop');
  pack.stability = node.find('statistics').attr('stability');
  return pack;
}

function loadContainerRecipe(node, orderlinelist) {
  var container = {};
  container.index = node.attr('index');
  container.containertypecode = node.attr('containertypecode');
  container.statistics = {};
  node.find('containerstatistics > statistic').each(function() {
    container.statistics[ $(this).attr('name') ] = $(this).attr('value');
  });
  container.packagelist = {};
  node.find('physicalresult > package').each(function() {
    var pack = loadPackage( $(this) );
    pack.orderline = orderlinelist[pack.orderlineid];
    container.packagelist[ pack.index ] = pack;
  });
  container.instructionlist = node.find('instructionlist');

  return container;
}

/*
function Rectangle (w, h) {
	this.width = w;
	this.height = h;
}

{
var rect = new Rectangle(10, 20);
}
*/

function loadRecipe(node) {
  setStatus('Parsing recipe...');
  var result = {};
  result.xml = node.text();
  $orderNode = node.find('order');
  result.order = loadOrder($orderNode);
  result.statistics = {};
  node.find('recipestatistics > statistic').each(function() {
    result.statistics[ $(this).attr('name') ] = $(this).attr('value');
  });
  result.containerlist = {};
  node.find('containerrecipelist > containerrecipe').each(function() {
    var c = loadContainerRecipe( $(this), result.order.orderlinelist );
    c.containertype = result.order.containertypelist[c.containertypecode];
    result.containerlist[ c.index ] = c;
  });

  return result;
}

function create3DMeshes() {
  setStatus('Creating 3D objects...');

  // prepare container type meshes
  for (var key in $recipe.order.containertypelist) if ($recipe.order.containertypelist.hasOwnProperty(key)) {
    var containertype = $recipe.order.containertypelist[key];
    
    // console.log(containertype);
    
    containertype.geometry = new THREE.BoxBufferGeometry( containertype.pw, containertype.ph, containertype.pl );
    
    containertype.material = new THREE.MeshStandardMaterial( { color: 0xa0a0a0 }); //Laurynas 29d added   ,vertexColors: THREE.FaceColors
    containertype.offset = { x: -containertype.ol, y: -containertype.oh/2, z: -containertype.ow };
    

    var mesh = new THREE.Mesh( containertype.geometry, new THREE.MeshFaceMaterial() );
  }
// console.log("containertype");
  
// console.log(containertype);

  // prepare orderline meshes
  for (var key in $recipe.order.orderlinelist) if ($recipe.order.orderlinelist.hasOwnProperty(key)) {
    var orderline = $recipe.order.orderlinelist[key];
    orderline.geometry = new THREE.BoxBufferGeometry( orderline.width, orderline.height, orderline.length );
    orderline.material = new THREE.MeshStandardMaterial( { color: orderline.color } );
  }
  // console.log("orderline");
  
  // console.log(orderline);

  // create container scenes
  for (var key in $recipe.containerlist) if ($recipe.containerlist.hasOwnProperty(key)) {
    var container = $recipe.containerlist[key];

    container.mesh = new THREE.Mesh();

    var mesh;

    mesh = new THREE.Mesh(container.containertype.geometry, container.containertype.material);
    mesh.position.set(container.containertype.offset.x, container.containertype.offset.y, container.containertype.offset.z);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    container.mesh.add( mesh );

    for (var p in container.packagelist) if (container.packagelist.hasOwnProperty(p)) {
      var pack = container.packagelist[p];
      mesh = new THREE.Mesh(pack.orderline.geometry, pack.orderline.material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(pack.x, pack.z, -pack.y);
      mesh.rotation.set(pack.rotx, pack.rotz, pack.roty);
      container.mesh.add(mesh);

      var edges = new THREE.EdgesGeometry( pack.orderline.geometry );
      var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000, lineWidth: 3 } ) );
      line.position.copy(mesh.position);
      line.rotation.copy(mesh.rotation);
      container.mesh.add( line );

      
    }
  }  
}

function createContainerPreviews() {
  setStatus('Creating previews...');

  for (var key in $recipe.containerlist) if ($recipe.containerlist.hasOwnProperty(key)) {
	var container = $recipe.containerlist[key];
	createContainerPreview('#containerpreviews', container);
  }
}

function customizeXmlObj(jsObj){
  
  var resultList = {};

  var GOLDEN_RATIO_CONJUGATE = 0.618033988749895;
  var _h = 0;
  var _v = 0;
  


  var orderlinelist = jsObj.order.orderlinelist;
  var orderLine = jsObj.order.orderlinelist.orderline;


  //console.log(orderLine);

  var productcode;



 
  //iterating properties
var testas = orderLine[0];

for (var item in testas) {
console.log(item);


}

 
  

    //for (i = 0; i < orderLine.length; i++) {
      //console.log("a");
      
      //console.log("dirbam dar cia");

      for (var orderiux in orderLine) {
      
        var oldValue = orderiux.toString();
        var newValue = orderLine[orderiux].productcode;
       
        
        orderLine[newValue] = orderLine[oldValue];
        
        console.log(typeof(oldValue));
        console.log(typeof(newValue));
        delete orderLine.orderiux;

        //listas = orderLine[productcode];
        //delete orderLine.oldValue;
        console.log(orderLine);
        
        //return listas
      }
     

 // }

        

       

//console.log(orderLine);
  




}



function readRecipeFile(file) {
  setStatus('Loading recipe...');

  //laurynas change to other method not parseXML
  $.get('recipe.xml', function(data) {
    

    var xmlObj = XML2jsobj(data.documentElement);    

    var addCustomParameters = customizeXmlObj(xmlObj);


    $recipe = xmlObj;

    

    // var xml = $( $.parseXML( data ) );

  
    // var recipeNode = xml.find('recipe').first();
	  // if (recipeNode.text() == "") {
    //   var xml = $( data );
    //   var recipeNode = xml.find('recipe').first();
	  // }
    // $recipe = loadRecipe( recipeNode );
    

    create3DMeshes();
    createContainerPreviews();
    
    

    // update();

    setStatus('Recipe loaded: ' + $recipe.order.code);
    $("#statusLabel").fadeOut("slow", "swing", function(){$( this ).remove();});
  })
  .fail(function() {
    setStatus('Error: could not read recipe.xml');
  })
}
