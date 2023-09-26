
// If it is the first run, it will receive the required default information from data.json
if(localStorage.getItem("mdata") === null){
    fetch('./data.json')
    .then((res) => res.json())
    .then((res) => localStorage.setItem("mdata",JSON.stringify(res)));
    location.reload()

}


//  receive datas from localstorage
function Jdata(){
    return JSON.parse(localStorage.getItem("mdata"))
}


// calculates the price of currency pairs and stores them
class Pairs_data{
    constructor(jdata=Jdata()){
        var pairs={};
        var cur = ["USD"];
        var m,i;
        for( m in jdata["pairs"]){
            cur =cur.concat(m[3]+m[4]+m[5]);
        }

        for(m in cur){
            m=cur[m]
            for(i in cur){
                i=cur[i]
                if (i !== m){
                    var ip=1;
                    var mp=1;
                    if (i !=="USD"){
                        ip =jdata["pairs"]["USD"+i]
                    }
                    if (m !=="USD"){
                        mp =jdata["pairs"]["USD"+m]
                    }
                    pairs[i+m]=mp/ip
                }
            }
        }
        this.pairs=pairs

    }
}


// Checking the main language and setting the program language
function language(data = Jdata()){
    if (data === null){
        return;
    }
    if (data["lang"] ==="en"){
        return;
    }
    else if (data["lang"]==="fa"){
        var msg={
            "lab_currency_pair":"جفت ارز:",
            "lab_account_balance":"موجودی حساب:",
            "lab_risk_pecentage":"درصد ریسک:",
            "lab_stop_loss":"استاپ لاس (به پیپ):",
            "update":"بروزرسانی",
            "settings":"تنظیمات",
            "lab_result_lot":"حجم معامله به لات:",
            "lab_result_risk":"ریسک معامله به دلار:"
        }
        var sections =document.getElementsByName("sec")
        for (let i=0;i<sections.length;i++){
            sections[i].setAttribute("class","fa")
        }
        document.getElementById("body").setAttribute("class","body_fa")
        document.getElementById("settings").setAttribute("class","fbtn hbtn")
        document.getElementById("update").setAttribute("class","fbtn hbtn")

        for( eid in msg){
            document.getElementById(eid).innerHTML = msg[eid];
        }
        document.getElementById('calculate').value ="محاسبه"

    }

}

// set option for select tag
function pairs_opt(pairs_data){

    const select = document.querySelector('#pair');
    for(pair in pairs_data.pairs){
        let newOption = new Option(pair,pair);
        select.add(newOption,undefined);
    }
}

// Receives updated prices from my GitHub
async function update(){
    document.getElementById("update").removeEventListener("click",update);
    two_language_msg("Updating...","در حال بروزرسانی٬٬٬")
    try{
        const res = await fetch('https://raw.githubusercontent.com/6hodrat/global_updates/main/forex_position_size_calculator/data.json')
        if(res.ok){
            let data = await res.json();
            save_update(data)
        }
    }
    catch (e){
        popup_msg.show_message(e,"error")
        document.getElementById("update").addEventListener("click",update)
        console.log(e)
    }
}

// Stores new information received from GitHub in Localstorage
function save_update(ndata){
    datas = Jdata()
    datas["pairs"]=ndata
    datas["update_time"] =Date.now()
    localStorage.clear()
    localStorage.setItem("mdata",JSON.stringify(datas))
    two_language_msg("Updated!","!بروز رسانی با موفقیت انجام شد")

}

// It displays pop-up messages for errors and...
class Popup_msg{
    constructor(){
        let msg = document.getElementById("message");
        this.msg = msg
        this.status = status
        this.time;
    }
    active(){
        this.msg.classList.add("msg_active")
    }
    deactive(){
        this.msg.classList.add("msg_deactive")
    }
    clear(){
        this.msg.setAttribute("class","message")
        this.msg.innerHTML=""
    }
    error(){
        this.msg.classList.add("msg_err")
    }
    normal(){
        this.msg.classList.remove("msg_err")
    }
    show_message(text,mtype="normal"){
        clearTimeout(this.time);

        this.msg.innerHTML=text;
        if (mtype === "error"){
            this.error()
        }
        else{
            this.normal()
        }
        this.active();


        this.time = setTimeout(() => {
            this.deactive();

            setTimeout(() => {
                this.clear()

            }, 500);

        }, 3000);
        return;




    }
}


// It receives the pop-up message for two languages and displays one of them according to the main language
function two_language_msg(en,fa,type="normal"){
    let datas=Jdata()
    if (datas["lang"]==="en"){
        popup_msg.show_message(en ,type)
    }
    else if (datas["lang"]==="fa"){
        popup_msg.show_message(fa ,type)
    }
}



// run fonctions
const pairs_data = new Pairs_data()
var popup_msg= new Popup_msg()
language()
pairs_opt(pairs_data)


// calculate
function calculate(last=Jdata()["last"],pairs = pairs_data["pairs"]){

    if(document.getElementById("balance").value ===''){
        var balance = Number(last["balance"])
    }
    else{
        var balance = Number(document.getElementById("balance").value);
    }

    if(document.getElementById("risk").value ===''){
        var risk = Number(last["risk"])
    }
    else{
        var risk = Number(document.getElementById("risk").value);
    }

    if(document.getElementById("stop_loss").value ===''){
        var stop_loss = Number(last["stop_loss"])
    }
    else{
        var stop_loss = Number(document.getElementById("stop_loss").value);
    }
    var pair = document.getElementById("pair").value
    if ((pair in pairs)===false){
        two_language_msg("The wrong currency pair has been entered",".جفت ارز اشتباه وارد شده است","error")
        return;
    }


    if(balance <= 0 || risk <= 0 || stop_loss <= 0 || Number.isNaN(balance) ||balance ==null|| Number.isNaN(risk) ||risk ==null|| Number.isNaN(stop_loss) ||stop_loss ==null){
        two_language_msg("The entered number is incorrect",".عدد وارد شده اشتباه است","error")
        return;
    }






    var risk_per_dollar = balance*risk/100;
    if (("USD"+pair[3]+pair[4]+pair[5]) in Jdata()["pairs"]){
        var pip_value= 1/Number(Jdata()["pairs"]["USD"+pair[3]+pair[4]+pair[5]]) *10;

    }
    else if((pair[3]+pair[4]+pair[5]) === "USD"){
        var pip_value= 10;
    }
    else{
        return;
    }
    var lot_size = risk_per_dollar/pip_value/stop_loss;


    document.getElementById("lab_result_lot").removeAttribute("class");
    document.getElementById("lab_result_risk").removeAttribute("class");
    document.getElementById("out_result_lot").removeAttribute("class"); document.getElementById("out_result_lot").innerHTML= lot_size.toFixed(2);
    document.getElementById("out_result_risk").removeAttribute("class");document.getElementById("out_result_risk").innerHTML ="$"+(risk_per_dollar.toFixed(0)).toString();
    data=Jdata();
    data['last']["pair"]=pair;
    data['last']["balance"]=balance;
    data['last']["risk"]=risk;
    data['last']["stop_loss"]=stop_loss;

    localStorage.clear()
    localStorage.setItem("mdata",JSON.stringify(data))



}



// set place holders and...
document.getElementById("balance").addEventListener("click",function(){document.getElementById("balance").value = "";});
document.getElementById("risk").addEventListener("click",function(){document.getElementById("risk").value = "";});
document.getElementById("stop_loss").addEventListener("click",function(){document.getElementById("stop_loss").value = "";});

let last =Jdata()["last"]
document.getElementById("pair").value =last["pair"];
document.getElementById("balance").value=last["balance"];document.getElementById("balance").placeholder=last["balance"]
document.getElementById("risk").value=last["risk"];document.getElementById("risk").placeholder=last["risk"];
document.getElementById("stop_loss").value=last["stop_loss"];document.getElementById("stop_loss").placeholder=last["stop_loss"];



// buttons handlers
document.getElementById("calculate").addEventListener("click",calculate)
document.getElementById("update").addEventListener("click",update)


// enter -> calculate()
document.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        calculate()
    }
});