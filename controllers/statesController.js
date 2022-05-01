// Import data
const { json } = require('express/lib/response');
const State = require('../model/State');
const statesJSONData = require('../model/states.json');

/*---------------------------------------------------------------------------------------
    GET Request Functions
---------------------------------------------------------------------------------------*/
const getAllStates = async (req, res) => {
    // Query parameter  
    const { contig } = req.query;

    // Holds results of query 
    let statesList = statesJSONData;

    // Return noncontiguous states
    if (contig === 'false') {
        statesList = statesJSONData.filter(st => st.code === 'AK' || st.code === 'HI');
        return res.json(statesList);
    }
    // Return contiguous states
    if (contig === 'true') {
        statesList = statesJSONData.filter(st => st.admission_number < 49);
        return res.json(statesList);
    }
    
    // Get all the state data documents from MongoDB
    const mongoStates = await State.find();

    // Loop through statesList array
    statesList.forEach(state => {
        // 1) Attempt to find the state from MongoDB states results
        const stateExists = mongoStates.find(st => st.stateCode === state.code);
     
        // 2) If the state is in the results, attach 'funfacts' property to the state object
        if(stateExists) {
            let funfactsArray = stateExists.funfacts;
            // One or more funfactss exist
            if (funfactsArray.length !== 0) {
                // Attach the funfactss with dot notation
                state.funfacts = [...funfactsArray]; 
            }
        }
    });
    res.json(statesList);
}

const getState = async (req, res) => {    
    // URL parameter sent in GET request
    const stateReq = req.params.state;

    // Find the requested state data in the statesJSONData
    const stateData = statesJSONData.find(state => state.code === stateReq);

    // Get all the state data documents from MongoDB 
    const mongoStates = await State.find();
    
    // Determine whether state exists in MongoDB collection
    const stateExists = mongoStates.find(st => st.stateCode === stateData.code);
    
    // Attach the funfactss from MongoDB if they exist
    if(stateExists) {
        let funfactsArray = stateExists.funfacts;
        // One or more funfactss exist
        if (funfactsArray.length !== 0) {
            // Attach the funfactss with dot notation
            stateData.funfacts = [...funfactsArray]; 
        }
    }
    res.json(stateData);
}

const getStateFunFacts = async (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get all the state data documents from MongoDB 
    const mongoStates = await State.find();
    
    // Determine whether state exists in MongoDB collection
    const stateExists = mongoStates.find(st => st.stateCode === stateData.code);
    
    // Attach the funfactss from MongoDB if they exist
    if(stateExists) {
        let funfactsArray = stateExists.funfacts;
        // One or more funfactss exist
        if (funfactsArray.length !== 0) {
            // Attach the funfactss with dot notation
            stateData.funfacts = [...funfactsArray]; 
        }
        else {
            // No funfactss exist
            return res.json({ "message": `No Fun Facts found for ${stateData.state}`});
        }
    }
    // Get the array of fun facts
    const funfactsArray = stateData.funfacts;
    
    // Generate a random number between 0 and array length
    let randomNum = Math.floor(Math.random()*funfactsArray.length);
    
    // Get funfacts at random index
    let funfacts = funfactsArray[randomNum];

    // Create a response with the random funfacts
    res.json({ funfacts });
}

const getStateCapital = (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get the state name and capital
    const state = stateData.state;
    const capital = stateData.capital_city;

    // Create a response with the state name and capital
    res.json({ state, capital });
}

const getStateNickname = (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get the state name and capital
    const state = stateData.state;
    const nickname = stateData.nickname;

    // Create a response with the state name and capital
    res.json({ state, nickname });
}

const getStatePopulation = (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get the state name and capital
    const state = stateData.state;
    // population as int 
    const popInt = stateData.population;   
    // Convert population to string and add commas
    const population = popInt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Create a response with the state name and capital
    res.json({ state, population });
}

const getStateAdmission = (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get the state name and capital
    const stateName = stateData.state;
    const admissionDate = stateData.admission_date;

    // Create a response with the state name and capital
    res.json({ stateName, admissionDate });
}

/*---------------------------------------------------------------------------------------
    POST Request Functions 
---------------------------------------------------------------------------------------*/
const createStateFunFacts = async (req, res) => {
    // Request body passes in 1) stateCode and 2) array of new funfacts(s) 
    const stateCode = req.body.stateCode;
    const funfacts = req.body.funfacts;
    console.log(stateCode);
    console.log(funfacts);

    // Verify the necessary values were passed in 
    if(!stateCode || !funfacts) {
        return res.status(400).json({"message": "State fun facts value required"});
    }

    // Verify new funfactss are passed in as array
    if (!funfacts instanceof Array || funfacts.length === 0) {
        return res.status(400).json({"message": "State fun facts value must be an array"});
    }

    // Find the requested state in MongoDB collection
    const foundState = await State.findOne({stateCode: stateCode});
    console.log(foundState);

    // If state has an existing array of funfactss, ADD the new funfactss to them (do NOT delete existing funfactss)
    // If the state does NOT have an existing array of funfactss, create a new record in MongoDB collection with stateCode and funfactss array
    let funfactsArray = foundState.funfacts;
    funfactsArray = funfactsArray.push(...funfacts);
    const result = await foundState.save();

    res.json(result);
}

module.exports = {
    getAllStates, 
    getState, 
    getStateFunFacts,
    getStateCapital,
    getStateNickname, 
    getStatePopulation,
    getStateAdmission,
    createStateFunFacts
}