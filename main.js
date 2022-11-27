const apJubilatorio = 0.15;
const apSalud = 0.045;
const apFrl = 0.001;
const valorBPC = 5164;

const sueldoNominal = window.prompt("Escribe el sueldo nominal");

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

function liquidarSueldo(sueldo){
    if(sueldo <= (7*valorBPC)){
        //No tributa IRPF

        const aportes = sueldo * (apJubilatorio + apSalud + apFrl);

        return sueldo - aportes;

    }else{
        //Tributa IRPF

        const aportes = (sueldo * (apSalud + apFrl)) + aporteJubilatorio(sueldo);
        const montoDeducciones = deducciones(sueldo, aportes);
        const imponibleIRPF = montoImponibleIRPF(sueldo);

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

        const irpfAPagar = primarioIRPF - montoDeducciones;

        return Math.round(sueldo - aportes - irpfAPagar);

    }
}

if(sueldoNominal <= 0 || isNaN(sueldoNominal)){
console.log("El sueldo debe ser un número mayor a 0.")
}else{
console.log(`El sueldo líquido de $${sueldoNominal} es $${liquidarSueldo(sueldoNominal)}`);
console.log(`Aportes jubilatorios: $${aporteJubilatorio(sueldoNominal)}`);
console.log(`Aportes FONASA (Salud): $${sueldoNominal * apSalud}`);
console.log(`Aportes FRL: $${sueldoNominal * apFrl}`);
console.log(`Impuestos (IRPF): $${sueldoNominal - liquidarSueldo(sueldoNominal) - aporteJubilatorio(sueldoNominal) - (sueldoNominal * (apSalud + apFrl))}`);
}