var request = require('request')
var subscriptionKey=""
function identify()
{
     request.post({
        headers: {'content-type':'application/json'},
        url:'https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false',
        
    },function(error, response, body){
    console.log(body)
  });

}
