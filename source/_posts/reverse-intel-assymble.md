---
title: 理解汇编
date: 2023-12-31 16:32:00
tags:
draft: true
---

基于 Mac + gcc + clang

编译语句: `arch -x86_64 gcc -S -masm=intel demo.c`

## 数据分配和寻址

### 赋值

赋值操作通常分为两类:

1. 直接将变量值放到内存对应的栈变量上

2. 先将右值初始化到eax上，再将eax放到内存对应的栈变量上

#### int 整型

```c
int i = 9;
```

```assymble
mov	dword ptr [rbp - 116], 9
```

#### char 字符类型

```c
char i = 'c';
```

```assymble
mov	byte ptr [rbp - 121], 99
```

#### float 浮点数

```c
float f = 10;
```

```assymble
movss	xmm0, dword ptr [rip + LCPI0_0] ## xmm0 = mem[0],zero,zero,zero
movss	dword ptr [rbp - 120], xmm0
```

#### 

## 控制流

### 函数调用

#### 序言 (--gpt)

函数序言是一个函数体开头的一系列指令，通常用于在函数执行开始时进行一些准备工作。函数序言的具体内容可能因架构和编程语言的不同而有所不同，但通常包括以下几个常见的步骤：

1. **保存寄存器状态：** 函数序言通常会保存一些寄存器的状态，以确保在函数执行期间这些寄存器的值不会被破坏。这样做的目的是保护调用函数的上下文，防止函数的执行对调用者造成意外的影响。通常使用 `push` 指令将寄存器的值推送到栈上。

2. **建立栈帧：** 函数序言会建立一个新的栈帧，其中包含局部变量、参数和其他与函数执行相关的信息。通常使用 `sub` 指令在栈上分配一定大小的空间来存储局部变量。

3. **保存帧指针：** 如果使用了帧指针（例如 `ebp` 寄存器），函数序言可能会保存和设置帧指针，以便在函数体内能够更轻松地访问局部变量和参数。

4. **参数传递：** 函数序言可能会将传递给函数的参数复制到适当的位置，以便在函数体内使用。这通常是通过将参数从寄存器或栈上的位置移动到适当的寄存器或栈上的位置完成的。

通常为

```assymble
push rbp  ## 保存旧栈帧

mov rbp, rsp  ## 创建新栈帧
sub rsp, ...

mov ..., ...  ## 压参
mov ..., ...
...
```

#### 函数体

通常函数体调用以`call`启动，做一些计算或I/O。

#### 尾声 (--gpt)

函数尾声是函数体的结尾部分，通常包括一系列指令，用于清理栈、恢复寄存器状态以及处理函数的返回值。函数尾声的具体内容可能因架构和编程语言的不同而有所不同，但通常包括以下几个常见的步骤：

1. **恢复栈帧：** 函数尾声会撤销函数序言建立的栈帧。通常使用 `add` 指令或 `mov` 指令将栈指针恢复到函数调用前的状态，释放在函数执行期间分配的栈空间。

2. **恢复寄存器状态：** 如果函数序言保存了一些寄存器的状态，函数尾声会将这些寄存器的值恢复到函数调用前的状态。通常使用 `pop` 指令将之前压入栈的值弹出到寄存器中。

3. **返回：** 使用 `ret` 指令将程序控制权返回到调用函数的地方。`ret` 指令通常会从栈中弹出返回地址，并将程序控制权传递到该地址。

4. **处理返回值：** 如果函数有返回值，函数尾声可能会将返回值放置到适当的寄存器或者指定的内存位置。返回值通常存储在 `eax` 寄存器中（对于整数值的情况），或者通过其他约定放置在指定的位置。

5. **清理参数：** 如果函数在栈上分配了空间用于存储参数，函数尾声可能会清理这些参数，以确保在函数执行结束后栈上不再留下未使用的参数。

#### 示例

```c
int func(int i){
  int c = i;
  return 0;
}

int main(int argc, char *argv[])
{
  int in = 8;
  func(in);
  return 0;
}
```

```assymble
	.globl	_func                     ## 声明 _func 为全局标识符
	.p2align	4, 0x90               ## 使用 `0x90` 对齐填充 2 ^ 4 个比特
_func:                                ## _func段开始
	.cfi_startproc                    ## 函数定义开始
## %bb.0:
	push	rbp                       ## 保存旧栈帧的 base

	.cfi_def_cfa_offset 16            ## 设置
	.cfi_offset rbp, -16
	mov	rbp, rsp
	.cfi_def_cfa_register rbp

	mov	dword ptr [rbp - 4], edi      ## 初始化 int i

	mov	eax, dword ptr [rbp - 4]      ## 初始化 int c
	mov	dword ptr [rbp - 8], eax

	xor	eax, eax                      ## 通过 xor，将eax清零，表示调用正常
	pop	rbp                           ## 恢复旧栈帧的 base
	ret                               ## 函数返回
	.cfi_endproc                      ## 函数结束


	.globl	_main                           ## -- Begin function main
	.p2align	4, 0x90
_main:                                  ## @main
	.cfi_startproc
## %bb.0:
	push	rbp
	.cfi_def_cfa_offset 16
	.cfi_offset rbp, -16
	mov	rbp, rsp
	.cfi_def_cfa_register rbp
	sub	rsp, 32
	mov	dword ptr [rbp - 4], 0
	mov	dword ptr [rbp - 8], edi
	mov	qword ptr [rbp - 16], rsi
	mov	dword ptr [rbp - 20], 8
	mov	edi, dword ptr [rbp - 20]
	call	_func
	xor	eax, eax
	add	rsp, 32
	pop	rbp
	ret
	.cfi_endproc
                                        ## -- End function
```

### if 判断

#### 示例1

#### 示例2

### for 循环

for 循环包含`循环头`和`循环体`，其中`循环体`又包含两部分，用于更新循环的固定语句以及用户写的代码。

`循环头`并不是指for循环中括号内的全部部分，而是一个简单的，是否跳出for循环的判断。

`循环体`指`循环变量的更新代码`以及`for循环体中的用户代码`。

#### 示例1

```c
#include <stdio.h>

int main(int argc, char *argv[])
{
  int c;
  for (int i=0; i<10; i++)
    c = i;
  return 0;
}
```

对应的for循环代码

```assymble
    ...
LBB0_1:                                 ## 循环头
	cmp	dword ptr [rbp - 24], 10           ## 循环头判断
	jge	LBB0_4                             ## 结束循环
## %bb.2:                               ## 用户代码
	mov	eax, dword ptr [rbp - 24]
	mov	dword ptr [rbp - 20], eax
## %bb.3:                               ## 循环变量更新代码
	mov	eax, dword ptr [rbp - 24]
	add	eax, 1
	mov	dword ptr [rbp - 24], eax
	jmp	LBB0_1
LBB0_4:
    ...
```

#### 示例2

### while 循环

### switch 分支

