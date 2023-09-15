var calibrating = false;
var calibrated = false;

function calibrate (){
    if (calibrating == false) {
        document.getElementById("caliB").style.backgroundColor = "red";
        calibrating = true;

        contenido = [42, 34, 44, 53, 75, 52, 39, 54, 38, 38, 31, 22, 33, 62, 73, 53, 48, 42, 44, 64, 96, 83, 68, 82, 77, 93, 82, 77, 72, 42, 37, 56, 80, 76, 73, 51, 41, 66, 83, 68, 52, 57, 60, 67, 73, 67, 67, 97, 103, 85, 55, 66, 89, 130, 354, 630, 884, 1060, 1403, 1926, 2401, 1917, 1165, 1467, 2100, 2059, 1437, 1234, 1325, 1600, 1339, 900, 1614, 1492, 1084, 1391, 1477, 1335, 827, 646, 557, 339, 232, 192, 186, 164, 138, 126, 76, 66, 59, 69, 109, 157, 191, 115, 68, 129, 130, 93, 97, 78, 104, 140, 174, 390, 553, 544, 755, 1278, 1374, 1093, 1142, 1288, 2175, 2276, 1203, 582, 803, 1667, 1611, 1395, 2023, 1781, 1219, 836, 454, 814, 896, 675, 894, 989, 610, 885, 1061, 1328, 1308, 771, 814, 818, 760, 803, 652, 667, 1027, 1100, 878, 816, 815, 1000, 905, 374, 342, 443, 282, 188, 217, 136, 128, 243, 241, 192, 219, 188, 120, 55, 44, 66, 75, 81, 152, 237, 335, 245, 53, 100, 160, 128, 186, 301, 673, 943, 655, 699, 1615, 2213, 1867, 2531, 1990, 639, 848, 794, 1355, 1865, 1513, 1031, 906, 1231, 1412, 1120, 1198, 1057, 841, 1007, 893, 1102, 1372, 1628, 2216, 2017, 1150, 962, 601, 846, 914, 329, 197, 102, 95, 75, 208, 328, 210, 85, 129, 158, 134, 108, 122, 115, 80, 85, 103, 110, 85, 69, 67, 90, 95, 74, 160, 197, 140, 99, 83, 91, 82, 67, 82, 90, 121, 122, 94, 146, 180, 213, 235, 156, 93, 116, 97, 112, 133, 461, 1024, 1657, 1883, 1492, 1053, 780, 787, 716, 779, 1500, 1742, 1283, 1189, 1316, 1231, 1083, 1037, 872, 1050, 1042, 881, 867, 870, 764, 722, 784, 1065, 1428, 1134, 1211, 1764, 2066, 1880, 1809, 1371, 1025, 931, 581, 423, 534, 806, 1110, 895, 566, 694, 656, 454, 143, 61, 57, 90, 127, 184, 293, 200, 54, 40, 26, 35, 41, 34, 45, 47, 40, 47, 39, 24, 33, 41, 32, 37, 68, 105, 99, 61, 86, 87, 40, 37, 42, 44, 62, 63, 506, 859, 836, 933, 755, 446, 356, 265, 104, 89, 79, 50, 74, 53, 91, 153, 126, 95, 70, 68, 78, 92, 90, 60, 79, 90, 51, 56, 61, 49, 49, 32, 28, 53, 45, 39, 50, 50, 43, 30, 30, 48, 48, 43, 52, 37, 46, 46, 39, 53, 39, 28, 31, 29, 47, 46, 35, 38, 38, 30, 27, 27, 27, 44, 36, 35, 36, 31, 38, 42, 32, 15, 28, 45, 47, 46, 175, 207, 167, 250, 199, 254, 297, 260, 389, 375, 422, 549, 628, 776, 744, 1026, 788, 125, 52, 53, 69, 82, 66, 83, 87, 40, 56, 154, 158, 54, 31, 592, 1060, 895, 636, 279, 430, 819, 515, 110, 56, 25, 23, 28, 62, 82, 44, 58, 78, 66, 67, 37, 42, 54, 184, 250, 149, 55, 33, 53, 54, 47, 55, 60, 51, 48, 87, 69, 47, 69, 52, 48, 50, 44, 41, 34, 32, 33, 36, 41, 36, 41, 40, 30, 31, 32, 35, 34, 30, 22, 23, 42, 53, 48, 48, 53, 49, 44, 56, 57, 54, 54, 42, 47, 48, 52, 49, 48, 46, 32, 31, 35, 43, 51, 50, 58, 62, 50, 51, 53, 50, 42, 30, 55, 60, 32, 32, 38, 47, 67, 58, 41, 38, 28, 31, 38, 48, 51, 46, 50, 65, 60, 36, 31, 29, 30, 25, 22, 39, 43, 44, 45, 38, 41, 50, 54, 49, 59, 56, 44, 48, 53, 48, 30, 36, 61, 55, 32, 45, 67, 58, 41, 37, 46, 54, 52, 53, 42, 42, 47, 38, 37, 59, 60, 41, 34, 41, 50, 40, 42, 49, 54, 42, 45, 60, 62, 41, 33, 52, 52, 31, 26, 46, 55, 55, 47, 50, 62, 55, 49, 59, 62, 66, 41, 37, 43, 33, 35, 24, 39, 44, 66, 73, 42, 32, 37, 49, 47, 46, 70, 84, 69, 42, 31, 46, 52, 37, 30, 35, 67, 86, 48, 43, 72, 64, 48];
    }
    else {
        document.getElementById("caliB").style.backgroundColor = "darkred";
        calculateThresholds();
        calibrating = false;
        calibrated = true;
    }
}

function calculateThresholds () {
   
    console.log(contenido);
    
    fsps = 20;                 // Samples per second
    
    initBase = 25*fsps-1;
    endBase = contenido.length;
    nBase = endBase - initBase;
    
    initTop = 2*fsps-1;
    endTop = initBase;
    nTop = endTop - initTop;


    /* Base threshold (Deactivativation) */
    
    // Constants filter
    kSmoothBase = (50*(10**(-3)))/100;
    kRoughBase = (50*(10**(-3)))/(150*(10**(-3)));
    console.log(kSmoothBase);
    console.log(kRoughBase);

    // Constants threshold
    kDesviationBase = 6;
    kThresholdBase = 1.5;
    
    xBase = contenido.slice(initBase, endBase);

    yBase = [];
    yBase[0] = xBase[0];
    for (let j = 1; j < nBase; j++) {
        if (xBase[1] < yBase[j-1])
            yBase[j] = (1-kRoughBase)*yBase[j-1]+kRoughBase*xBase[j];
        else 
            yBase[j] = (1-kSmoothBase)*yBase[j-1]+kSmoothBase*xBase[j];
    } 
    console.log(yBase);

    // Base value
    base = mean(yBase);
    
    // Threshold 
    thresholdBase = kThresholdBase * ( base + kDesviationBase * std(xBase));

    /* Top threshold (Activativation) */

    // Constants threshold
    kThresholdTop = 0.4;

    xTop = contenido.slice(initTop, endTop);
    
    yTop = [];
    for (let j = initTop; j < endTop; j++) {
        if (xTop[j] > thresholdBase){
            yTop.push(xTop[j]);
        }
    }

    console.log(yTop);
    top = mean(yTop);

    delta = top - base;

    thresholdTop = base + kThresholdTop * delta;

    console.log("Base:" + base);
    console.log("Top:" + top);
}

function mean (array) {
    sum = 0;
    array.forEach((e) => {sum = sum + e});
    sum = sum / array.length;
    return sum;
}

function std (array) {
    sum = 0;
    array.forEach((e) => {sum = sum + Math.pow(e, 2)});
    sum = Math.sqrt(sum / (array.length-1));
    return sum;

}