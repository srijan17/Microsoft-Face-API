var express = require('express')
var fs = require('fs')
var bodyParser = require('body-parser')

var request = require('request')
var app = express()
app.use(express.static('public'));
app.use(bodyParser.json())

var subscriptionKey = "" //Subscription Key
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}))


var port = 8000

app.listen(port, function() {
    console.log('app listening to port', port)
})


app.post('/face', function(req, res) {
    var body = req.body.img
    console.log(body)
    console.log("herer")
    var base64Data = body.replace(/^data:image\/jpeg;base64,/, "");

    //Writes the image in out.jpeg
    require("fs").writeFile("public/out.jpeg", base64Data, 'base64', function(err) {
        console.log(err);
    });
    var data = { "url": "/out.jpeg" } //global url  of the savedImage

    //       request.post(
    //         {url:"https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false",

    //         body: data,
    //         headers: { "content-type": "application/json","Ocp-Apim-Subscription-Key":"fbbc07f6a0334dc5b3242714d09241c7"}
    //         },
    //         function (error, response, body) {        
    //             if (!error && response.statusCode == 200) {
    //                 console.log(body)
    //             }
    //             else
    //             {
    //                   console.log(error)
    //             }

    //         }
    //     );
    request({
        method: "POST",
        headers: { "content-type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKey },
        uri: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false",
        json: data
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("successs")
            var faceId = body[0].faceId
            data = {
                "personGroupId": "users",
                "faceIds": [
                    faceId
                ],
                "maxNumOfCandidatesReturned": 1,
                "confidenceThreshold": 0.5
            }
            request({
                method: "POST",
                headers: { "content-type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKey },
                uri: "https://westus.api.cognitive.microsoft.com/face/v1.0/identify",
                json: data
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("identified successfully")
                    var personId = body[0].candidates[0].personId;
                    console.log(personId)
                    request({
                        method: "GET",
                        headers: { "content-type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKey },
                        uri: "https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/users/persons/937213ff-38d5-4910-ab3f-2723aef28d75",

                    }, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log("success identify")
                            console.log(body)
                            var id = body.userData
                            console.log(id)

                            var retval = {
                                "AgeGenderInfo": {
                                    "Age": 27.4,
                                    "Gender": "male"
                                },
                                "Emotion": {
                                    "Anger": 0.00193443475,
                                    "Contempt": 0.00863969,
                                    "Disgust": 0.00150949042,
                                    "Fear": 0.162490487,
                                    "Happiness": 0.4467924,
                                    "Neutral": 0.00181576773,
                                    "Sadness": 0.000039718263,
                                    "Surprise": 0.376778036
                                },
                                "Name": body.name,
                                "UniqueId": 1
                            }
                        } else {

                            console.log("failure")
                        }
                    })
                } else {
                    console.log("error identify")
                    console.log(error)
                    console.log(response.body.error)
                    console.log(response.statusCode)
                }
            })
        } else {
            console.log("error")
            console.log(error)
            console.log(response.body.error)
            console.log(response.statusCode)
        }

    });
    console.log("done")

})