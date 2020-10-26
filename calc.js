"use strict"

const calcButtons=[
    ['0', 'zero'], ['1', 'one'], ['2', 'two'], ['3', 'three'], ['4', 'four'],
    ['5', 'five'], ['6', 'six'], ['7', 'seven'], ['8', 'eight'], ['9', 'nine'],
    ['/', 'divide'], ['*', 'multiply'], ['-', 'subtract'], ['+', 'add'], 
    ['=', 'equals'], ['.', 'decimal'], ['AC', 'clear'], ['+/-', 'plusMinus'], ["C", 'backspace']];

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            input: ['0'],
            buttons: calcButtons
        }
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(e) {
        buttonClickAudio();
        buttonClickVisual(e.target);
        this.setState({ input: buttonClickLogic(e.target, this.state.input) });
    }
    render() {
        console.log(this.state.input);
        const input = this.state.input;
        let myDisplay = input[input.length - 1];
        if (input.length > 1 && input[input.length - 2] === '-') {
            myDisplay = '-'.concat(input[input.length - 1])
        }
        return <div>
            <Display display={myDisplay} />
            <ButtonsPanel buttons={this.state.buttons} handleClick={this.handleClick} />
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));


function Display (props) {
    return <div id='display'><p>{props.display.length < 8 ? props.display : Number(props.display).toPrecision(4)}</p></div>
}

function ButtonsPanel (props) {
    return <div id='container'>
    {props.buttons.map(el => <Button buttonValue={el[1]} buttonName={el[0]} handleClick={props.handleClick} />)}
    </div>
}

function Button (props) {
    return <button name={props.buttonName} id={props.buttonValue} onClick={props.handleClick} >{props.buttonName}</button>
    }

function buttonClickAudio(){
    let audio = document.getElementById("audio");
        audio.play();
}

function buttonClickVisual(button){
    button.className="clicked";
    setTimeout(() => button.className = null, 200);
}

function buttonClickLogic(button, input){
    switch (button.id) {
        case 'clear':
            return ['0'];
        case 'zero': 
        case 'one':
        case 'two':
        case 'three':
        case 'four':
        case 'five':
        case 'six':
        case 'seven':
        case 'eight':
        case 'nine':{
            return digit(button.name, input);
            }
        case 'decimal': {
            return decimal(input);
        };
        case 'add':
        case 'divide':
        case 'multiply':{
            return addDivMult(button.name, input);
        };    
        case 'subtract': {
            return subtract(button.name, input);
        };
        case 'equals': {
            return equals(input);
        };
        case 'plusMinus': {
            return plusMinus(input);
        }
        case 'backspace': {
            return backspace(input);
        }
    }
};

function digit(button, input) {
    let num = input.pop();
    if (num === '0') {
        input.push(button);
    } else if (!isNaN(Number(num))) {
        num = num.concat(button);
        input.push(num);
    } else {
        input.push(num);
        input.push(button)
        };
    return input;
}

function decimal(input){
    let num = input[input.length - 1];
    if (num !== '.' &&  !num.includes('.')) {
        if (!isNaN(Number(num))) {
            num = num.concat('.');
        } else {
            num = '0'.concat('.');
        }
    input.pop()
    input.push(num);
    }
    return input;
}

function addDivMult(button, input){
    let num=input.pop();
    if (!isNaN(Number(num)) && num != 0) {
        input.push(num);
    } else if (num === '-' && input.length > 0 && isNaN(input[input.length - 1]) ){
        input.pop();
    };
    input.push(button);

    if (input.length == 1) {
        return ['0'];
    }
    console.log(input);
    return input;
}

function subtract(button, input){
    let num=input.pop();
    if ((num !== '0' && !isNaN(num) || num ==='/' || num === '*')) {
        input.push(num);
    };
    input.push(button);
    return input;
}

function equals(input) {
    if (isNaN(input[input.length - 1])) {
        input.pop();
    }
    if (input.length == 0) {
        return ['0'];
    }
    if (input.length == 1) {
        return input;
    }
    while (input.indexOf('*') !== -1) {
        input = evMult(input);
    }
    
    while (input.indexOf('/') !== -1) {
        input = evDiv(input);
    }
    
    while (input.indexOf('+') !== -1) {
        input = evSum(input);
    }

    while (input.length > 2) {
        input = evSub(input);
    }
    return input;
}

function evMult(input){
    let i = input.indexOf('*');
    if (!isNaN(input[i+1])) {
        input.splice(i-1, 3, String(Number(input[i-1])*Number(input[i+1])));
    } else {
        let signSolved = signProblem(input, '*');
        if (!signSolved[0]){
            input.splice(i-2, 5, String(Number(input[i-1])*Number(input[i+2])));
        } else {
            input.splice(i-(signSolved[1]-3), signSolved[1], signSolved[0], String(Number(input[i-1])*Number(input[i+2])));
        } 
    }
    return input;
}

function evDiv(input){
    let i = input.indexOf('/');
    if (!isNaN(input[i+1])) {
        input.splice(i-1, 3, String(Number(input[i-1])/Number(input[i+1])));
    } else {
        let signSolved = signProblem(input, '/');
        if (!signSolved[0]){
            input.splice(i-2, 5, String(Number(input[i-1])/Number(input[i+2])));
        } else {
            input.splice(i-(signSolved[1]-3), signSolved[1], signSolved[0], String(Number(input[i-1])/Number(input[i+2])));
        } 
    }
    return input;
}

function evSum(input){
    let i = input.indexOf('+');
    if (i === 1) {
        input.splice(i-1, 3, String(Number(input[i-1])+Number(input[i+1])));
    } else if(Number(input[i-1]) < Number(input[i+1])){
        input.splice(i-2, 4, String(Number(input[i+1])-Number(input[i-1])));
    } else {
        input.splice(i-1, 3, String(Number(input[i-1])-Number(input[i+1])));
    }
    return input;
}

function evSub(input){
    let i = input.indexOf('-');
    if (i === 0) {
        input.splice(i+1, 3, String(Number(input[i+1])+Number(input[i+3])));
        console.log(1, input);
    } else if(Number(input[i - 1]) > Number(input[i + 1])){
        input.splice(i-1, 3, String(Number(input[i-1])-Number(input[i+1])));
        console.log(2, input);
    } else {
        input.splice(i-1, 3, '-', String(Number(input[i+1])-Number(input[i-1])));
        console.log(3, input);
    }
    return  input;
}

function signProblem(input, artefact){
    let i = input.indexOf(artefact);
    if (i === 1 || input[i-2] === '/' || input[i-2] === '*'){
        return ['-', 4];
    }  else if(i === 2 || !isNaN(input[i-4])){
        return [null, 5];
    } else if(input[i - 2] === '-'){
        return ['+', 5];
    } else if(input[i - 2] === '+'){
        return ['-', 5]
    } else {
        console.log('signError function Error.')
    }
}

function plusMinus(input){
    console.log(input);
    if (input.length === 1){
        if  (input[0] === '+'){
            input =  ['-'];
        } else if(input[0] === '-') {
            input =  ['+'];
        } else if (!isNaN(input[0]) && input[0] !== '0'){
            input.unshift('-')
        } else {
            rinput =  ['-'];
        }
    } else if(!isNaN(input[input.length - 1])){
        if (input[input.length-2] === '-'){
            input.splice(input.length - 2, 1);
        } else {
            input.splice(input.length - 1, 0, '-');
        }
    }
    return input;
}

function backspace(input){
    if (input.length == 1 && isNaN(input[0])){
        input = ['0'];
    } else {
        let num = input.pop();
        if(num.length > 1) {
            num = num.slice(0, num.length-1);
            if (num) {
                input.push(num);
            }
        }
    } 
    if (input.length === 0) {
        input = ['0'];
    }
    return input;
}