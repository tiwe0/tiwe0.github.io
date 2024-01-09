console.log("sandbox loaded.")

var regex = {
    two_args: /\s*(\[?\w+\]?)\s*,\s*(\[?\w+\]?)\s*/
}

var registers = ["ax", "bx", "cx", "dx", "al", "ah", "bl", "bh", "cl", "ch", "dh", "dl", "cs", "ip", "si", "di", "sp", "bp", "ss", "ds", "es", "pws"];
function tb(value) {
    if (typeof value === "number") {
        return value.toString(2);
    }
    if (typeof value === "string") {
        if (value.endsWith("H")) return parseInt(value.replace("H", ""), 16).toString(2);
        if (value.endsWith("O")) return parseInt(value.replace("O", ""), 8).toString(2);
        return parseInt(value, 10).toString(2);
    }
    throw "Ex"
}

function isRegister(token) {
    return registers.includes(token);
};
function isMemory(token) {
    let trim_token = token.trim();
    return trim_token.startsWith('[') && trim_token.endsWith(']');
};

function checkType(token) {
    if (isRegister(token)) {
        return "register";
    };
    if (isMemory(token)) {
        return "memory";
    };
}

var coreInstructions = {
    mov(cmd) {
        let args = cmd.match(/mov(.*)/)[1];
        let two_args = args.match(regex.two_args);
        let left = two_args[1];
        let right = two_args[2];
        let rightValue = cpu.fetchValue(right);
        switch (checkType(left)) {
            case "register":
                cpu[left].write(rightValue);
                break;
            case "memory":
                let address = cpu.fetchMemAddress(left);
                memory.write(address, rightValue);
                break;
        }
        return true;
    },
    add(cmd) {
        let args = cmd.match(/add(.*)/)[1];
        let two_args = args.match(regex.two_args);
        let left = two_args[1];
        let right = two_args[2];
        let rightValue = parseInt(cpu.fetchValue(right), 2);
        let leftValue = parseInt(cpu.fetchValue(left), 2);
        let result = (rightValue + leftValue).toString(2);
        if (result.length < 8) {
            result = result.padStart(8, "0");
        } else if (result.length < 16) {
            result = result.padStart(16, "0");
        } else {
            return false;
        }
        switch (checkType(left)) {
            case "register":
                cpu[left].write(result);
                break;
            case "memory":
                let address = cpu.fetchMemAddress(left);
                memory.write(address, result);
                break;
        }
        return true;
    },
    sub(cmd) {
        let args = cmd.match(/add(.*)/)[1];
        let two_args = args.match(regex.two_args);
        let left = two_args[1];
        let right = two_args[2];
        let rightValue = parseInt(cpu.fetchValue(right), 2);
        let leftValue = parseInt(cpu.fetchValue(left), 2);
        let result = (leftValue - rightValue).toString(2);
        if (result.length < 8) {
            result = result.padStart(8, "0");
        } else if (result.length < 16) {
            result = result.padStart(16, "0");
        } else {
            return false;
        }
        switch (checkType(left)) {
            case "register":
                cpu[left].write(result);
                break;
            case "memory":
                let address = cpu.fetchMemAddress(left);
                memory.write(address, result);
                break;
        }
        return true;
    },
    push(cmd) { // push ax
        let args = cmd.match(/push\s*(\[?\w+\]?)/)[1];
        let spValue = parseInt(cpu.sp.getValue(), 2) - 2;
        let ssValue = parseInt(cpu.ss.getValue(), 2);
        cpu.sp.writeOneWord(spValue);
        let value = cpu.fetchValue(args);
        memory.write(ssValue + spValue, value);
        return true;
    },
    pop(cmd) { // pop ax
        let args = cmd.match(/pop\s*(\[?\w+\]?)/)[1];
        let spValue = parseInt(cpu.sp.getValue(), 2);
        let ssValue = parseInt(cpu.ss.getValue(), 2);
        let value = memory.readOneWord(ssValue + spValue);
        if (isMemory(args)) {
            let address = cpu.fetchMemAddress(args);
            memory.writeOneWord(address, value);
        } else if (isRegister(args)) {
            cpu[args].writeOneWord(value);
        }
        cpu.sp.write(spValue + 2);
        return true;
    }
};

class Register{
    constructor(size, name) {
        this.name = name;
        this.size = size;
        this.slots = Array(size);
        this.slots.fill(0);
        return new Proxy(this, {
            get(target, prop) {
                if (isNaN(parseInt(prop))) {
                    return target[prop];
                }
                let index = parseInt(prop);
                if (index >= size || index < 0)
                    throw "Ex";
                return target.slots[target.size - index - 1];
            },
            set(target, prop, value) {
                if (isNaN(parseInt(prop))) {
                    target[prop] = value;
                }
                let index = parseInt(prop);
                if (index >= size || index < 0)
                    throw "Ex";
                target.slots[target.size - index - 1] = value;
                target.render(index, value);
                return true;
            }
        });
    };
    render(index, value) {
        console.log("div#" + this.name + "_" + String(index));
        $("div#"+this.name+"_"+String(index)).text(value)
    };
    readOneWord() {
        let result = "";
        for (let index = 0; index < 16; index++){
            result += String(this.slots[index]);
        }
        return result;
    };
    readHWord() {
        let result = "";
        for (let index = 0; index < 8; index++){
            result += String(this.slots[index]);
        }
        return result;
    };
    readLWord() {
        let result = "";
        for (let index = 8; index < 16; index++){
            result += String(this.slots[index]);
        }
        return result;
    };
    write(value) {
        return this.writeOneWord(value.padStart(16, "0"));
    }
    writeOneWord(value) {
        for (let index = 0; index < 16; index++){
            this[15 - index] = parseInt(value[index]);
        }
    };
    writeHWord(value) {
        for (let index = 0; index < 8; index++){
            this[15 - index] = parseInt(value[index]);
        }
    };
    writeLWord(value) {
        for (let index = 0; index < 8; index++){
            this[7 - index] = parseInt(value[index]);
        }
    };
    getValue() {
        return this.readOneWord();
    }
}

class HRegister{
    constructor(register) {
        this.register = register;
        this.size = register.size / 2;
        this.slots = register.slots;
        return new Proxy(this, {
            get(target, prop) {
                if (isNaN(parseInt(prop))) {
                    return target[prop];
                }
                let index = parseInt(prop);
                if (index >= size || index < 0)
                    throw "Ex";
                return target.slots[target.size - index - 1];
            },
            set(target, prop, value) {
                if (isNaN(parseInt(prop))) {
                    target[prop] = value;
                }
                let index = parseInt(prop);
                if (index >= target.size || index < 0)
                    throw "Ex";
                target.slots[target.size - index - 1] = value;
                target.register.render(target.size + index, value);
            }
        });
    };
    write(value) {
        this.register.writeHWord(value.substring(0, 8));
    }
    getValue() {
        return this.register.readHWord();
    }
}

class LRegister{
    constructor(register) {
        this.register = register;
        this.size = register.size / 2;
        this.slots = register.slots;
        return new Proxy(this, {
            get(target, prop) {
                if (isNaN(parseInt(prop)))
                    return target[prop];
                let index = parseInt(prop);
                if (index >= target.size || index < 0)
                    throw "Ex";
                return target.slots[register.size - index - 1];
            },
            set(target, prop, value) {
                if (isNaN(parseInt(prop)))
                    target[prop] = value;
                let index = parseInt(prop);
                if (index >= target.size || index < 0)
                    throw "Ex";
                target.slots[register.size - index - 1] = value;
                target.register.render(index, value);
            }
        })
    };
    write(value) {
        this.register.writeLWord(value.substring(0, 8));
    }
    getValue() {
        return this.register.readLWord();
    }
}

class CPU {
    constructor() {
        this.ax = new Register(16, "ax");
        this.bx = new Register(16, "bx");
        this.cx = new Register(16, "cx");
        this.dx = new Register(16, "dx");

        this.ah = new HRegister(this.ax);
        this.al = new LRegister(this.ax);

        this.bh = new HRegister(this.bx);
        this.bl = new LRegister(this.bx);

        this.ch = new HRegister(this.cx);
        this.cl = new LRegister(this.cx);

        this.dh = new HRegister(this.dx);
        this.dl = new LRegister(this.dx);

        this.cs = new Register(16, "cs");
        this.ip = new Register(16, "ip");

        this.si = new Register(16, "si");
        this.di = new Register(16, "di");
        this.sp = new Register(16, "sp");
        this.bp = new Register(16, "bp");
        this.ss = new Register(16, "ss");
        this.ds = new Register(16, "ds");
        this.es = new Register(16, "es");
        this.psw = new Register(16, "psw");

    };
    eval(cmd) {
        let instruction = this.parse(cmd);
        return coreInstructions[instruction](cmd);
    };
    parse(cmd) {
        cmd = cmd.trim();
        return cmd.match(/(\w+)\s*.*/)[1];
    };
    fetchMemAddress(token) {
        let memory_ds = parseInt(cpu.ds.getValue(), 2) * 16;
        let memory_offset = parseInt(token.match(/\[(\d+)\]/)[1], 10);
        return memory_ds + memory_offset;
    };
    fetchValue(token) { 
        if (isRegister(token)) {
            return cpu[token].getValue();
        };
        if (isMemory(token)) {
            let address = this.fetchMemAddress(token);
            return memory.readOneWord(address);
        };
        return tb(token);
    };
}

class Memory{
    constructor(size) {
        this.memorySlots = Array(size); // bit
        this.memorySlots.fill(0);
        this.size = size;
        this.renderLimit = 20;
        this.renderStart = new Proxy({ value: 0 }, {
            set(target, prop, value) {
                if (prop === "value") {
                    value = value <= 0 ? 0 : value;
                    value = value > (memory.size / 8 - memory.renderLimit) ? memory.size / 8 - memory.renderLimit : value;
                    target[prop] = value
                    memory.render();
                    return true;
                }
                target[prop] = value;
                return true;
            }
        });
        return new Proxy(this, {
            get(target, prop) {
                if (isNaN(parseInt(prop))) {
                    return target[prop];
                }
                let index = parseInt(prop);
                if (index >= size || index < 0)
                    throw "Ex";
                return target.memorySlots[index];
            },
            set(target, prop, value) {
                if (isNaN(parseInt(prop))) {
                    target[prop] = value;
                }
                let index = parseInt(prop);
                if (index >= size || index < 0)
                    throw "Ex";
                target.memorySlots[index] = value;
                target.render();
                return true;
            }
        })
     };
    read(address, bits_size) { 
        if (address * 8 + bits_size >= memory.size) {
            throw "Ex";
        }
        bits_size = Math.ceil(bits_size / 8) * 8;
        let bits = "";
        for (let halfbyte = bits_size / 8 - 1; halfbyte >= 0; halfbyte--) {
            for (let offset = 0; offset < 8; offset++){
                bits += String(memory[(address + halfbyte) * 8 + offset]);
            }
        }
        return bits;
    };
    write(address, bits) {
        if (address * 8 + bits.length >= memory.size) {
            throw "Ex";
        }
        bits = bits.padStart((Math.ceil(bits.length / 8) * 8), "0");
        for (let halfbyte = bits.length / 8 - 1, index = 0; halfbyte >= 0; halfbyte--, index++) {
            for (let offset = 0; offset < 8; offset++){
                memory[(address + halfbyte) * 8 + offset] = parseInt(bits[index * 8 + offset]);
            }
        }
        return bits;
     };
    parseAddress(address) {
        if (typeof address === "number") return address;
        if (typeof address === "string" && address.endsWith('H')) {
            return parseInt(address.replace('H', ''), 16);
        }
     };
    parseContent(content, pad) { 
        if (typeof content === "number") return content.toString(2).padStart(pad, "0");
        if (typeof content === "string" && content.endsWith('H')) return parseInt(address.replace('H', ''), 16).toString(2).padStart(pad, "0");
        return content.padStart(pad, "0");
    };
    render() {
        if (memory.renderStart.value < 0 || memory.renderStart.value >= memory.size / 8 - memory.renderLimit) return;
        $("div#memory-slots").find("div.memory-slot").each(function (index, element) {
            $(element).text((index+memory.renderStart.value).toString(16).toUpperCase().padStart(5, "0") + "H");
        });
        $("div.memory-slot").each(function (index, element) {
            for (let offset = 0; offset < 8; offset++) {
                let position = (memory.renderStart.value + index) * 8 + offset;
                $(element).append("<div class='memory-slot-bit'>"+String(memory[position])+"</div>");
            }
        });
    };
    readOneWord(address) { 
        address = this.parseAddress(address);
        return this.read(address, 16);
    };
    readHalfWord(address) {
        address = this.parseAddress(address);
        return this.read(address, 8);
     };
    writeOneWord(address, content) {
        address = this.parseAddress(address);
        content = this.parseContent(content, 16);
        this.write(address, content);
    };
    writeHalfWord(address, content) {
        address = this.parseAddress(address);
        content = this.parseContent(content, 8);
        this.write(address, content);
    };
    getValue(offset) {
        let base = parseInt(cpu.ds.getValue(), 2) * 16;
        offset = parseInt(offset);
        return this.readOneWord(base + offset);
    }
}

var cpu = new CPU();
var memory = new Memory(1 * 1024 * 1024 * 8);  // 1MB
var sandbox = {
    cpu: cpu,
    memory: memory,
    arch_size: 16
}
