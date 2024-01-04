(function () {
    // 初始化
    $("div#registers > div.register").each(function (index, element) {
        for (let index = sandbox.arch_size - 1; index >= 0; index--) {
            let id = element.id;
            let slot_div = "<div class='slot' id='" + id + "_" + String(index) + "'>0</div>";
            $(element).append(slot_div);
        }
    });
    $("div#memory-slots").map(function (index, element) {
        for (let index = memory.renderStart.value; index < (memory.renderStart.value + memory.renderLimit); index++) {
            $(element).append("<div class='memory-slot flex-h-container'>"+index.toString(16).toUpperCase().padStart(5, "0")+"H</div>");
        }
    });
    $("div.memory-slot").each(function (index, element) {
        for (let index = 0; index < 8; index++){
            $(element).append("<div class='memory-slot-bit'>0</div>");
        }
    });
    $("#console-text").keydown(function (event) { 
        if (event.which === 13) {
            let cmd = $("#console-text").val();
            cpu.eval(cmd);
            $("#console-text").val("");
            event.preventDefault();
        }
    });

    // 事件绑定
    $("div#memory-slots").on("wheel", function (event) {
        if (event.originalEvent.deltaY > 0) {
            memory.renderStart.value += 1;
        } else {
            memory.renderStart.value -= 1;
        }
    })
}())