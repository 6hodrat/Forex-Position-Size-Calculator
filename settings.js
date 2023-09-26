

// receive datas from localstorage
function Jdata(){
    return JSON.parse(localStorage.getItem("mdata"))
}

// If it is the first run, it will receive the required default information from data.json
if(localStorage.getItem("mdata") === null){
    fetch('./data.json')
        .then((res) => res.json())
        .then((res) => localStorage.setItem("mdata",JSON.stringify(res)));
        location.reload()
        
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


// change language function
function language(data = Jdata()){
    if (data === null){
        return;
    }
    if (data["lang"] ==="en"){
        let select = document.querySelector('#lang'); 
        let newOption = new Option("English","en");
        select.add(newOption,undefined);
        newOption = new Option("Persian","fa");
        select.add(newOption,undefined);
        document.getElementById("lab_last_update_time").innerHTML="Last Update:";
    }
    else if (data["lang"]==="fa"){
        var msg={
            "lab_language":"زبان:"
        }
        var sections =document.getElementsByName("sec")
        for (let i=0;i<sections.length;i++){
            sections[i].setAttribute("class","fa")
        }
        document.getElementById("body").setAttribute("class","body_fa")

        for( eid in msg){
            document.getElementById(eid).innerHTML = msg[eid];
        }
        document.getElementById('save').value ="ذخیره"
        let select = document.querySelector('#lang'); 
        let newOption = new Option("فارسی","fa");
        select.add(newOption,undefined);
        newOption = new Option("انگلیسی","en");
        select.add(newOption,undefined);
        
        document.getElementById("lab_last_update_time").innerHTML="آخرین بروزرسانی:";
    }
    
}

// Changes the main language of the program
function change_lang(){
    var lang = document.getElementById("lang").value

    data=Jdata();
    if (lang ==="fa"){
        data["lang"]="fa"
    }
    else if(lang === "en"){
        data["lang"]="en"
    }
    else{
        return;
    }
    
    localStorage.clear()
    localStorage.setItem("mdata",JSON.stringify(data))
}

// Display the price of currency pairs
const pairs_data = new Pairs_data()
var p = "" 
for(pair in pairs_data.pairs){
    p = p+'<section name="sec"><label>'+pair+'</label><label>'+pairs_data.pairs[pair].toFixed(5)+'</label></section>'
}
document.getElementById("pairs").innerHTML=p


// Display the time of the last update 
let date =new Date(Number(Jdata()["update_time"]))
document.getElementById("out_last_update_time").innerHTML= date.getFullYear().toString()+"-"+(date.getMonth()+1).toString()+"-"+date.getDate().toString()


// save button -> change_lang()
document.getElementById("save").addEventListener("click",change_lang)


language()


