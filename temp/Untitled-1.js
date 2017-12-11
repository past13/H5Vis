
  Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};


  // var deleteElements = orderLine.filter(function(el)  {   

          
        //   return Object.getOwnPropertyNames(orderLine) !== "0";
              
        //       // return el.productcode !== "R001_CU";
        // })


  var deleteElements = orderLine.filter(function(el)  {   
    
              
              // return Object.getOwnPropertyNames(orderlinelist) !== "0";
                  
              // console.log(el);

                  return true; 
            })


            // console.log( Object.keys(orderLine)[0]);

            


  var arrayObj = [{  key1: 'value1', key2: 'value2'},{ key1: 'value1', key2: 'value2'}],
  i;

// for (i = 0; i < arrayObj.length; i++) {
//   arrayObj[i].stroke = arrayObj[i]['key1'];
  
//   delete arrayObj[i].key1;
// }

// for (var i = 0; i < orderLine.length; ++i)
//   {
//     // rv[i] = orderLine[i];
//     orderLine[i] = orderLine[i].productcode;    
//   } 

  var obj = { 0: 'a', 1: 'b', 2: 'c' };
  
          var newObject = {};
  
          var newName = "naujasVardas";
          var newValue = "naujaReiksme";
  
          newObject[newName] = newValue;

          Object.getOwnPropertyNames(orderLine).forEach(
            function (val, idx, array) {
              orderLine.productcode = "name" + idx;        
            }
          );


          var test1 = Object.getOwnPropertyNames(orderLine);
          
       
               // orderLine[newValue] = orderLine[oldValue];
               
               // delete orderLine.orderiux;
               //listas = orderLine[productcode];
               //delete orderLine.oldValue;
                 
               //return listas