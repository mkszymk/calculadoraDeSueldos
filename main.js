const apJubilatorio = 0.15;
const apSalud = 0.045;
const apFrl = 0.001;
const valorBPC = 5164;
const cotDolarUy = 39;

class Persona{
    constructor(nombre, sueldo, esExtranjero){
        this.nombre = nombre;
        this.sueldo = sueldo;
        this.esExtranjero = esExtranjero;
    }
}

const sueldo1 = window.prompt("Introduce un sueldo para Juan:");
const sueldo2 = window.prompt("Introduce un sueldo para Pedro:");
const sueldo3 = window.prompt("Introduce un sueldo para Camila:");

const funcionario1 = new Persona("Juan", sueldo1, true);
const funcionario2 = new Persona("Pedro", sueldo2, false);
const funcionario3 = new Persona("Camila", sueldo3, false);

const deducciones = (sueldo, montoAportes) => {
    return (sueldo > 15*valorBPC) ? (montoAportes * 0.08) : (montoAportes * 0.1);
}

const montoImponibleIRPF = (sueldo) => {
    return (sueldo > 10*valorBPC) ? (sueldo * 1.06) : (sueldo);
}

const aporteJubilatorio = (sueldo) => {
    if (sueldo > 215179){
        return 215179 * apJubilatorio;
    } else{
        return sueldo * apJubilatorio;
    }
}

const liquidacionIRNR = (sueldo) => {
    //IRNR es el impuesto que los extranjeros pagan si trabajan en Uruguay, siempre es 12%. El IRPF solo lo pagan los uruguayos, y el porcentaje es progresivo.

    return sueldo * 0.12;
}

const liquidacionIRPF = (sueldo) => {

    const aportes = (sueldo * (apSalud + apFrl)) + aporteJubilatorio(sueldo);
    const montoDeducciones = deducciones(sueldo, aportes);
    const imponibleIRPF = montoImponibleIRPF(sueldo);

    if(imponibleIRPF <= (7*valorBPC)){
        return 0;
    }else{
        
        let primarioIRPF = 0;

        for(let i = 0; i <= imponibleIRPF; i++){

            if(i < 7 * valorBPC){
                primarioIRPF += 0;
            } else if(i <= 10 * valorBPC && i > 7 * valorBPC){
                primarioIRPF += 0.1;
            }else if(i <= 15 * valorBPC && i > 10 * valorBPC){
                primarioIRPF += 0.15;
            }else if(i <= 30 * valorBPC && i > 15 * valorBPC){
                primarioIRPF += 0.24;
            }else if(i <= 50 * valorBPC && i > 30 * valorBPC){
                primarioIRPF += 0.25;
            }else if(i <= 75 * valorBPC && i > 50 * valorBPC){
                primarioIRPF += 0.27;
            }else if(i <= 115 * valorBPC && i > 75 * valorBPC){
                primarioIRPF += 0.31;
            }else if(i > 115 * valorBPC){
                primarioIRPF += 0.36;
            }
        }

        return primarioIRPF - montoDeducciones;

    }
}

function liquidarSueldo(persona){
    sueldo = persona.sueldo;

    if(persona.esExtranjero){
        const irnrAPagar = liquidacionIRNR(sueldo);

        return Math.round(persona.sueldo - irnrAPagar);
    }else{
        const aportes = (sueldo * (apSalud + apFrl)) + aporteJubilatorio(sueldo);
        const irpfAPagar = liquidacionIRPF(sueldo);

        return Math.round(sueldo - aportes - irpfAPagar);
    }

}

function mostrarResultados(persona){
    if(persona.sueldo <= 0 || isNaN(persona.sueldo)){
        console.log("Debes ingresar un sueldo válido para " + persona.nombre);
    } else{
        console.log(`---------- Liquidación de ${persona.nombre} ----------`);
        console.log(`Sueldo nominal antes de impuestos: $${persona.sueldo} --- Aproximadamente ${(persona.sueldo / cotDolarUy).toFixed(0)} dólares.`);
        console.log(`Es extranjero?: ${persona.esExtranjero ? "Sí." : "No."}`);
        if(!persona.esExtranjero) console.log(`Aportes a la seguridad social: $${((persona.sueldo * (apSalud + apFrl)) + aporteJubilatorio(persona.sueldo)).toFixed(0)}.`);
        console.log(`Impuestos: $${persona.esExtranjero ? (liquidacionIRNR(persona.sueldo).toFixed(0) + " -> IRNR.") : (liquidacionIRPF(persona.sueldo).toFixed(0) + " -> IRPF.")}`);
        console.log(`Sueldo líquido: $${liquidarSueldo(persona)} --- Aproximadamente ${(liquidarSueldo(persona)/cotDolarUy).toFixed(0)} dólares.`);
        console.log("");
    }
}

let listaPersonas = [funcionario1, funcionario2, funcionario3];

console.log("Liquidando el sueldo de " + listaPersonas.length + " personas...");

for(const persona of listaPersonas){
    mostrarResultados(persona);
}

let listaSueldos = [];

for(let i = 0; i < listaPersonas.length; i++){
    listaSueldos.push(listaPersonas[i].sueldo);
}

listaSueldos.sort((a, b) => a - b);

console.log(`Lista de sueldos ordenados de menor a mayor:`);
listaSueldos.forEach( (sueldo) => {
    console.log(`N°${listaSueldos.indexOf(sueldo) + 1}: ${sueldo}`);
});

