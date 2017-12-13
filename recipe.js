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
  // console.log($recipe);

  var containerType = $recipe.order.containertypelist;


  // prepare container type meshes
  for (var key in $recipe.order.containertypelist) if ($recipe.order.containertypelist.hasOwnProperty(key)) {
    var containertype = $recipe.order.containertypelist[key];

    containertype.geometry = new THREE.BoxBufferGeometry( containertype.physicalsize.width, containertype.physicalsize.height, containertype.physicalsize.length );
    
    containertype.material = new THREE.MeshStandardMaterial( { color: 0xa0a0a0 });
    //todo: check with change xyz parameters
    containertype.offset = { x: -containertype.contentoffset.deltax, y: -containertype.contentoffset.deltaz/2, z: -containertype.contentoffset.deltay }; 
    var mesh = new THREE.Mesh( containertype.geometry, new THREE.MeshFaceMaterial() );
  }

  // // prepare orderline meshes
  // for (var key in $recipe.order.orderlinelist) if ($recipe.order.orderlinelist.hasOwnProperty(key)) {
  //   var orderline = $recipe.order.orderlinelist[key];
    
  //   orderline.geometry = new THREE.BoxBufferGeometry( orderline.size.width, orderline.size.height, orderline.size.length );
  //   orderline.material = new THREE.MeshStandardMaterial( { color: orderline.color } );
  // }
 
  // create container scenes
  for (var key in $recipe.containerrecipelist.containerrecipe) if ($recipe.containerrecipelist.containerrecipe.hasOwnProperty(key)) {
    var container = $recipe.containerrecipelist.containerrecipe[key];    
    container.mesh = new THREE.Mesh();

    var mesh;
    mesh = new THREE.Mesh(containerType.geometry, containertype.material);
    mesh.position.set(containertype.offset.x, containertype.offset.y, containertype.offset.z);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    container.mesh.add( mesh );

    

    for (var p in container.physicalresult.package) if (container.physicalresult.package.hasOwnProperty(p)) {
      var pack = container.physicalresult.package[p];

      // console.log(pack);
      // mesh = new THREE.Mesh(pack.orderline.geometry, pack.orderline.material);
      // mesh.castShadow = true;
      // mesh.receiveShadow = true;
      // mesh.position.set(pack.x, pack.z, -pack.y);
      // mesh.rotation.set(pack.rotx, pack.rotz, pack.roty);
      // container.mesh.add(mesh);

      // var edges = new THREE.EdgesGeometry( pack.orderline.geometry );
      // var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000, lineWidth: 3 } ) );
      // line.position.copy(mesh.position);
      // line.rotation.copy(mesh.rotation);
      // container.mesh.add( line );      
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

//todo: create abstract class for creating default meshes
function createDefaultMesh( orderline ) {
  //todo: add default meshes
  orderline.mesh = {};
    // prepare orderline meshes    
  orderline.geometry = new THREE.BoxBufferGeometry( orderline.size.width, orderline.size.height, orderline.size.length );
  orderline.material = new THREE.MeshStandardMaterial( { color: orderline.color } );
}

var GOLDEN_RATIO_CONJUGATE = 0.618033988749895;
var _h = 0;
var _v = 0;

function getNextColor() {
  var _color = new THREE.Color();
  _color.setHSL(_h, 1.00, 0.50 + 0.30 * _v);
  _h = (_h + GOLDEN_RATIO_CONJUGATE) % 1;
  _v = (_v + GOLDEN_RATIO_CONJUGATE) % 1;
  return _color;
}

var orderlinelist = [];
var packcontainerlist = [];

function customizeOrderLine(orderline) {
    //add color 
    orderline.color = getNextColor();
    //create default mesh
    createDefaultMesh(orderline);  
  return orderline;
}

var container = {};

function customizeXmlObj(jsObj){ 
  // todo: module pattern?
  var containerTypeCode = jsObj.containerrecipelist.containerrecipe;
  var templist = jsObj.order.orderlinelist.orderline; 
  
  //assign productcode to orderlineid //todo: move away
  for (var item in containerTypeCode) {       
    packcontainerlist = containerTypeCode[item].physicalresult.package;

    for (var pack in packcontainerlist) {    
      if (packcontainerlist[pack].orderlineid == "0") {
        packcontainerlist[pack].orderlineid = packcontainerlist[pack].productcode; 
      }  
    }
  } 
  container.packagelist = {};
  // console.log(containerTypeCode);

  // container.packagelist = {};
  $.each(packcontainerlist, (function(key, value, templist) {
    var pack = customizeOrderLine( $(this) );   
    console.log(pack[key].orderlineid);

    // packcontainerlist.orderline = templist[pack.productcode];   

    // container.packagelist[ pack.productcode ] = pack;

   
    // packcontainerlist = orderlinelist[pack.orderlineid];
  }));
  
  // console.log( container);


 

  // jsObj.order.orderlinelist = orderLineList;

  for (var key in templist) {
    var orderline = customizeOrderLine(templist[key]); 
  
    // var orderLineList1 = jsObj[orderline.index];
   
// console.log(orderline);
    
    // packcontainerlist[pack].orderlinelist  = orderline;
   }

  //recalculate rotation number ir orderline //todo: move away
  containerTypeCode.map(function(x) {
    var z = x.physicalresult.package;

    z.map(function(x) {
      x.rotation.x *=  (Math.PI/180);
      x.rotation.y *=  (Math.PI/180);  
      x.rotation.z *=  (Math.PI/180);       
    });    
  });
  // console.log(jsObj);
  
  return jsObj;
}

function readRecipeFile(file) {
  setStatus('Loading recipe...');

  //laurynas change to other method not parseXML
  $.get('recipe.xml', function(data) {

    var xmlObj = XML2jsobj(data.documentElement);    
    var recipe = customizeXmlObj(xmlObj);    
    $recipe = recipe;
    
    create3DMeshes();
    // createContainerPreviews();

    // update();

    setStatus('Recipe loaded: ' + $recipe.order.code);
    $("#statusLabel").fadeOut("slow", "swing", function(){$( this ).remove();});
  })
  .fail(function() {
    setStatus('Error: could not read recipe.xml');
  })
}




/*
class Rectangle {

  constructor (w, h) {
    this.width = w;
    this.height = h;
    this.color = 234523;
  }

  getarea() {
    return this.width * this.height;
  }
}

var r = new Rectangle(10, 20);
r.getarea();
*/
/*
var r = { 
  width: 20,
  height:10, 
  
  getarea() { 
    return this.width * this.height; 
  } 
}

r.getvolume = new function() { this.height * ... }
r.getvolume();
*/


  //  Object.entries(orderLine).forEach(([key, value]) => {

  //   var oldValue = key.toString();
  //   var newValue = orderLine[key].productcode.toString();

  //   var temp = ${key}

  //   // consooole.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
  //   });

