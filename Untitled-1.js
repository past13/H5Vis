
  // var keyNames = Object.key(orderLine);
 // for (var i = 0, l = orderLine.length; i < l; i++) {
  console.log(orderLine);

//console.log(orderLine[0]['productcode']);

var orderLine = orderLine[0];

console.log(orderLine);

for (var line in orderLine){
  // console.log(line, orderLine[line])
 
  console.log(orderLine[line]);
line = orderLine[line]['productcode'];

}


for (var line in orderLine) {
   for (var i =0; i <orderLine.length; i++) {
        var orderLine = orderLine[i];
       }
}

  for (var key in orderLine) {
    
    var productcode = orderLine[key].productcode;
    
    
    orderLine[productcode] = orderLine[key];  
  delete orderLine[key];
 
  }





console.log("naujas metoda");
  
var x = 2;

  
 
  


  

  //console.log("rezultate" + orderLine);




  

    // Object.keys(orderLine).each(function(data) {
    //   console.log(data);
    // });    

    // Object.defineProperty(orderLine, productCode, Object.getOwnPropertyDescriptor(orderLine, old_key));

    // Object.keys(orderLine) = productCode;

  //   Object.keys(orderLine).forEach(function(key) {
  //     new_obj[key] = orderLine[key];
  // });

  console.log(orderLine[0]['productcode']);
  
  for (var line in orderLine){
    // console.log(line, orderLine[line])
   
    console.log(line, orderLine[line]);
  line = orderLine[line]['productcode'];
  
  }
  console.log(orderLine);
  
  
  for (var line in orderLine) {
     for (var i =0; i <orderLine.length; i++) {
          var orderLine = orderLine[i];
         }
  }
  
    for (var key in orderLine) {
      
      var productcode = orderLine[key].productcode;
      
      
      orderLine[productcode] = orderLine[key];  
    delete orderLine[key];
   
    }
  
  
  
  
  
  console.log("naujas metoda");
    
  var x = 2;
  