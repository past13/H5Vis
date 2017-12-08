



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

  function loadRecipe(node) { 
    // setStatus('Parsing recipe...');
  
    console.log( "loadRecipe");
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


    result = {
        order: result.order, 
        statistics: result.statistics,
        containerlist: result.containerlist
    };
   
    return result;
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

  function loadOrder(node) {

    var order = {}; //could be global   

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
    //needcheck
    pack.rotx = node.find('rotation').attr('x') * (Math.PI/180);
    pack.roty = node.find('rotation').attr('y') * (Math.PI/180);
    pack.rotz = node.find('rotation').attr('z') * (Math.PI/180);
    pack.remwot = node.find('statistics').attr('remainingweightontop');
    pack.stability = node.find('statistics').attr('stability');
    return pack;
  }

  // var s,
  // NewsWidget = {
  
  //   settings: {
  //     numArticles: 1,
  //     articleList: 12,
  //     moreButton: 32
  //   },
  
  //   init: function() {
  //     // kick things off
  //     s = this.settings;
  //   }
  
  // };

    // function parseXML(file) {  
    //     $.get(file, function(data) {                    
    //         xmlObj = XML2jsobj(data.documentElement);   
    //         console.log("data");     
    //         return xmlObj;
    //     }); 
    // };


    // //parse with third party lib XML2jsobj and returns global
    // function parseXML(file) {  
    //     $.get(file, function(data) {                    
    //         xmlObj = XML2jsobj(data.documentElement);   
    //         console.log("data");     
    //         return xmlObj;
    //     }); 
    // };

//switch for different file types? 
const fileExtension  = "xml";
var $XmlModel = {};
var $containerrecipelist = {};
var $recipestatistics = {};
var $order = {};
type = {};





function readRecipeFile (file){  
  XmlModel = (function () {         
    $.ajax({
        async: false,
        type: "GET",
        global: false,
        dataType: fileExtension,
        url: file,
        success: function (data) { xmlObj = XML2jsobj(data.documentElement); }
    });          

    return { 
            containerrecipelist: xmlObj.containerrecipelist,
            order: xmlObj.order,
            recipestatistics: xmlObj.recipestatistics,
            type: xmlObj.type
    }
  }());

$containerrecipelist = XmlModel.containerrecipelist;
$recipestatistics = XmlModel.recipestatistics;
$type = XmlModel.type;

return XmlModel;
}


var testXml = readRecipeFile("recipe.xml");
$XmlModel = testXml;




  




