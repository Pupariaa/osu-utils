function CaStd (h3, h1, h5, h0){
    return (100.0 * (6 * h3 + 2 * h1 + h5)) / (6 * (h5 + h1 + h3 + h0));
}

function CaTaiko (h3, h1, h0){
    return (100.0 * (2 * h3 + h1)) / (2 * (h3 + h1 + h0));
}

function CaCtb (h3, h1, h5, k, h0){
    return (100.0 * (h3 + h1 + h5)) / (h3 + h1 + h5 + k + h0);
}

function CaMania (h3, h1, h5, g, k, h0){
    return (100.0 * (6 * g + 6 * h3 + 4 * k + 2 * h1 + h5)) / (6 * (h5 + h1 + h3 + h0 + g + k));
}

module.exports = {
    CaStd, 
    CaTaiko,
    CaCtb, 
    CaMania
}