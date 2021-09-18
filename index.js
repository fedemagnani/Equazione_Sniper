const { writeFileSync, readFileSync } = require("fs")
const { join } = require("path/posix")

var points = [
    {
        x: 1631282400,
        y: 1680000000
    },
    {
        x: 1631516400,
        y: 1520000000
    },
    {
        x: 1631656800,
        y: 1430000000
    },
    {
        x: 1631872800,
        y: 1350000000
    }
    // {
    //     x: 14,
    //     y: 6
    // },
]
var grade = points.length-1 //potrebbe aver senso che il grado sia sempre il numero di punti disponibili -1

function determinante(arrayDiArray){
    var m = arrayDiArray
    return m.length == 1 ?
    m[0][0] :
    m.length == 2 ? 
    m[0][0]*m[1][1]-m[0][1]*m[1][0] :
    m[0].reduce((r,e,i) => r+(-1)**(i+2)*e*determinante(m.slice(1).map(c => c.filter((_,j) => i != j))),0)  
}

function getEquation(points, grade) {
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'z']
    var mockEq = "y="
    for (var i = 0; i < grade; i++) {
        var currentGrade = grade - i
        mockEq += `${letters.shift()}${currentGrade === 1 ? "x" : "x^" + currentGrade}+`
    }
    var ogMockEq =mockEq 
    mockEq += letters.shift()
    var ogMockEq =mockEq 
    mockEq+="1"
    console.log(mockEq)
    var system = ""
    var explycitSystem = ""
    for (var i = 0; i < points.length; i++) {
        var newEquation = mockEq.replace("y", points[i].y).replace(/x/gi, `(${points[i].x})`) + "\n"
        var newEquationImplicit = newEquation
        var splitEq = newEquation.split("=").pop().split("+")
        for (var j = 0; j < splitEq.length; j++) {
            var noBracketsText = splitEq[j].replace("(", "").replace(")", "")
            if (noBracketsText.includes("^") && noBracketsText.split("^").length === 2) {
                var splitNum = noBracketsText.split("^")
                var powedNum = splitNum[0].replace(/[0-9]/g, '')+ Math.pow((splitNum[0].replace(/\D/g, "")), Number(splitNum[1]))
                newEquation = newEquation.replace(splitEq[j], powedNum)
            } else {
                newEquation = newEquation.replace(splitEq[j], noBracketsText)
            }
        }
        system += newEquationImplicit
        explycitSystem += newEquation
    }
    console.log(system)
    console.log(explycitSystem)
    var matriceTerminiNoti=[]
    var matriceCoefficienti = []
    var equations = explycitSystem.split("\n")
    equations.pop()
    for(var i=0;i<equations.length;i++){
        var equalSplit=equations[i].split("=")
        matriceTerminiNoti.push((equalSplit[0]).replace(/\./g, ""))
        var rigaCoeffic = equalSplit[1].replace(/\+/gi,"").replace(/\./gi, "").split(/\D/)
        rigaCoeffic.shift()
        matriceCoefficienti.push(rigaCoeffic)
    }   
    console.log("Matrice termini noti",matriceTerminiNoti)
    console.log("Matrice dei coefficienti",matriceCoefficienti)
    writeFileSync(join(__dirname,"matricecoefficienti.json"),JSON.stringify(matriceCoefficienti))
    var determinanteMatriceCoefficienti = determinante(matriceCoefficienti)
    if(determinanteMatriceCoefficienti===0){
        console.log("Shito! Il determinante della matrice dei coefficienti è nullo, sono crashato")
    }
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'z']
    var vettoreCoeffSol = []
    for(var k=0;k<matriceTerminiNoti.length;k++){
        var matriceCoefficientiCorretta=JSON.parse(readFileSync(join(__dirname,"matricecoefficienti.json")))
        for(var i=0;i<matriceCoefficienti.length;i++){
            matriceCoefficientiCorretta[i][k]=matriceTerminiNoti[i]
        }
        console.log(matriceCoefficientiCorretta)
        var solNum = determinante(matriceCoefficientiCorretta)/determinanteMatriceCoefficienti
        var soluzione = `${letters[k]}=${solNum}`
        vettoreCoeffSol.push(soluzione)
    }
    console.log("Vettore Soluzione: ",vettoreCoeffSol)
    var finalEq = ogMockEq
    for(var i=0;i<vettoreCoeffSol.length;i++){
        var splitted=vettoreCoeffSol[i].split("=")
        var letter =splitted[0]
        var number= Number(splitted[1])
        finalEq=finalEq.replace(new RegExp(letter, 'gi'),number)
    }
    console.log(finalEq)
    return finalEq
}

getEquation(points, grade)