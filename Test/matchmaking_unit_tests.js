// external
var expect = require('Chai').expect;
// internal
const matchmaking = require('../Server/Modules/Matchmaking');
const config = require('../config.json');
config.logLevel = "ERROR";

describe('Matchmaking Validation Tests', function() {
    let test_example = {
        username: "tester",
        important_data : ["One", "Two", "Three"],
        other_data : [1, 2, 3, 4],
        test_data : "Bum"
    };

    let test_example_list = [
        {
            username: "biff",
            important_data : ["One", "Two", "Four"],
            other_data : [1, 2, 3, 4],
            test_data : "Bum"
        },
        {
            username: "chip",
            important_data : ["Two", "Five"],
            other_data : [5, 6, 7, 8],
            test_data : "Bum"
        },
        {
            username: "kipper",
            important_data : ["Four", "Five", "Six"],
            other_data : [9, 0, 1, 2],
            test_data : "Bum"
        }
    ]

    let test_result_list = [
        {
            username: "biff",
            important_data : ["One", "Two"],
            other_data : [1, 2, 3, 4],
            test_data : "Bum"
        },
        {
            username: "chip",
            important_data : ["Two"],
            other_data : [5, 6, 7, 8],
            test_data : "Bum"
        }
    ]



    it('Should filter out users without matching preferences', function (done){
        let result = matchmaking.RemoveUsersFromPreferencesListWithNoMatchingPreferences('important_data', test_example_list, test_example.important_data);
        expect(result.length).to.eql(2);
        expect(result[0].username).to.eql("biff");
        expect(result[0].important_data).to.eql(["One", "Two"]);
        expect(result[1].username).to.eql("chip");
        expect(result[1].important_data).to.eql(["Two"]);
        done();
    })


});
