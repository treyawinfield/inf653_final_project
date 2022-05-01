// Import data
const { json } = require('express/lib/response');
const State = require('../model/State');
const statesJSONData = require('../model/states.json');

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
     
        // 2) If the state is in the results, attach 'funfact' property to the state object
        if(stateExists) {
            let funfactArray = stateExists.funfacts;
            console.log(funfactArray);
            // One or more funfacts exist
            if (funfactArray.length !== 0) {
                // Attach the funfacts with dot notation
                state.funfacts = [...funfactArray]; 
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
    
    // Attach the funfacts from MongoDB if they exist
    if(stateExists) {
        let funfactArray = stateExists.funfacts;
        // One or more funfacts exist
        if (funfactArray.length !== 0) {
            // Attach the funfacts with dot notation
            stateData.funfacts = [...funfactArray]; 
        }
    }
    res.json(stateData);
}

const getStateFunFact = async (req, res) => {
    // Get the URL parameter
    const stateReq = req.params.state;

    // Find the specified state from the states.json data
    const stateData = statesJSONData.find(state => state.code === stateReq);
    
    // Get all the state data documents from MongoDB 
    const mongoStates = await State.find();
    
    // Determine whether state exists in MongoDB collection
    const stateExists = mongoStates.find(st => st.stateCode === stateData.code);
    
    // Attach the funfacts from MongoDB if they exist
    if(stateExists) {
        let funfactArray = stateExists.funfacts;
        // One or more funfacts exist
        if (funfactArray.length !== 0) {
            // Attach the funfacts with dot notation
            stateData.funfacts = [...funfactArray]; 
        }
        else {
            // No funfacts exist
            return res.json({ "message": `No Fun Facts found for ${stateData.state}`});
        }
    }
    // Get the array of fun facts
    const funfactArray = stateData.funfacts;
    
    // Generate a random number between 0 and array length
    let randomNum = Math.floor(Math.random()*funfactArray.length);
    
    // Get funfact at random index
    let funfact = funfactArray[randomNum];

    // Create a response with the random funfact
    res.json({ funfact });
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

module.exports = {
    getAllStates, 
    getState, 
    getStateFunFact,
    getStateCapital,
    getStateNickname, 
    getStatePopulation,
    getStateAdmission
}