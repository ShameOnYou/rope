let points = []
let sticks = []
let width = 150;
let height = 150;
let now
let then = Date.now()
let delta
let gravity = -0.0000981
let fps = 60
let interval = 1000/fps
let mousePosition = {x:0, y:0}
let radius = 5
let pointA = {}
let pointB = {}
let simulating = false
let numIterations = 5

function createPoint(clickX, clickY){
    let point = {
        posX: clickX,
        posY: clickY,
        prevPosX: clickX,
        prevPosY: clickY,
        locked: false,
        index: points.length
    }
    points.push(point)
}

function createStick(pointOne, pointTwo){
    const dist = getDistanceBetweenPoints(pointOne, pointTwo)
    let stick = {
        pointA: pointOne,
        pointB: pointTwo,
        length: dist
    }
    sticks.push(stick)
}

function render(ctx){
    ctx.clearRect(0, 0, width, height);
    sticks.forEach(stick => {
        ctx.fillStyle = "#757575"
        ctx.beginPath();
        ctx.lineWidth="2";
        ctx.moveTo(stick.pointA.posX, stick.pointA.posY);
        ctx.lineTo(stick.pointB.posX, stick.pointB.posY);
        ctx.stroke();
    })
    points.forEach(p => {
        if(p.locked){
            ctx.fillStyle = "#ab1c1c"
        }else{
            ctx.fillStyle = "#000000";
        }
        ctx.beginPath();
        ctx.moveTo(p.posX, p.posY)
        ctx.arc(p.posX, p.posY, radius, 0, 2 * Math.PI, false);
        ctx.fill();
    })

}

function simulate(delta){


    points.forEach( p => {
        if(!p.locked){
            let posXBefore = p.posX
            let posYBefore = p.posY
            p.posX += p.posX - p.prevPosX
            p.posY += p.posY - p.prevPosY
            p.posY += -1 * gravity * delta * delta
            p.prevPosX = posXBefore
            p.prevPosY = posYBefore
        }
    })

    for(let i = 0; i < numIterations; i++){
        sticks.forEach(stick => {
            const dist = getDistanceBetweenPoints(stick.pointA, stick.pointB)
            let aX = stick.pointA.posX
            let bX = stick.pointB.posX
            let aY = stick.pointA.posY
            let bY = stick.pointB.posY
            let stickCentreX = (aX + bX) / 2
            let stickCentreY = (aY + bY) / 2
            let stickDirX = (aX - bX) / dist
            let stickDirY = (aY - bY) / dist
            if(!stick.pointA.locked){
                stick.pointA.posX = stickCentreX + stickDirX * stick.length / 2
                stick.pointA.posY = stickCentreY + stickDirY * stick.length / 2
            }
            if(!stick.pointB.locked) {
                stick.pointB.posX = stickCentreX - stickDirX * stick.length / 2
                stick.pointB.posY = stickCentreY - stickDirY * stick.length / 2
            }

        })
    }

}



function AnimationLoop() {
    now = Date.now()
    delta = now - then
    if(simulating){
        simulate(delta)
    }
    window.requestAnimationFrame(AnimationLoop)


    if (delta > interval) {
        then = now;
        const ctx = document.getElementById("rope").getContext("2d")
        render(ctx)
    }
}

function getMousePos(event) {
    const rect = document.getElementById("rope").getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    createPoint(x,y)
}

function storeMousePos(event){
    const rect = document.getElementById("rope").getBoundingClientRect()
    mousePosition.x = event.pageX - rect.left;
    mousePosition.y = event.pageY - rect.top;

}


function GetCanvasSize() {
    const canvas = document.getElementById("rope");
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}


window.onload = () => {
    //canvas always fills the whole window
    window.addEventListener("resize", GetCanvasSize, false);
    GetCanvasSize();

    document.addEventListener("click", getMousePos, false);
    document.addEventListener('mousemove', storeMousePos, false);
    document.addEventListener('keyup', function(e){
        if(e.code === "KeyS"){
            simulating = !simulating;

        }
        if(e.code === "KeyD"){
            let x = mousePosition.x
            let y = mousePosition.y
            checkIfInCircle(x, y)
        }
        if(e.code === "KeyF"){
            let x = mousePosition.x
            let y = mousePosition.y
            freezePoint(x, y)
        }
        if(e.code === "KeyR"){
            points = []
            sticks = []
            simulating = false

        }
        if(e.code === "KeyC"){
            createCloth()
        }




    }, false);
    window.requestAnimationFrame(AnimationLoop)

}

function freezePoint(x, y){
    points.forEach(p => {
        const dx = x - p.posX
        const dy = y - p.posY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < radius) {
            p.locked = !p.locked;

        }
    })
}

function checkIfInCircle(x,y){
    console.log(x, y)
    points.forEach(p => {
        const dx = x - p.posX
        const dy = y - p.posY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < radius) {
            if(isEmpty(pointA)){
                console.log(p.index)
                pointA = p
                document.getElementById("pointSet").innerText = "Point 1 Set"
            }else if (isEmpty(pointB) && p !== pointA){
                pointB = p
                document.getElementById("pointSet").innerText = ""
                createStick(pointA, pointB)
                pointA = {}
                pointB = {}

            }
        }
    })

}

function getDistanceBetweenPoints(pointOne, pointTwo){
    const dx = pointOne.posX - pointTwo.posX
    const dy = pointOne.posY - pointTwo.posY
    return Math.sqrt(dx * dx + dy * dy)
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function createCloth(){
    for(let i = 0; i < 20; i++){
        for(let b = 0; b < 30; b++){
            createPoint(600 + 30 * b, 200 + 30 * i)
        }
    }
    let notThisOne = 29
    points.forEach((p, i)=> {
        if((p.posY === 200 && i % 5 === 0) || i === 29){
            p.locked = true
        }
        if(points[i + 30] != null){
            createStick(p, points[i + 30])
        }
        if(points[i - 30] != null){
            createStick(p, points[i - 30])
        }
        if(points[i + 1] != null && points.indexOf(p) !== notThisOne){
            createStick(p, points[i + 1])
        }else if(points.indexOf(p) === notThisOne){
            notThisOne += 30
        }

    })
}

