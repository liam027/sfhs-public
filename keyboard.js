let keyboard;
let keyboardDisplayArea;;

function initialize_keyboard(){
  keyboard = document.querySelector("#keyboard-popup");
  keyboardDisplayArea = document.querySelector("#keyboard-display-area");
  keyboardTextBox = document.querySelector("#keyboard-text-box");
  popupArea = document.querySelector("#keyboard-popup");
  exitButton = document.querySelector("#keyboard-exit");
  delButton = document.querySelector("#keyboard-del");
  enterButton = document.querySelector("#keyboard-submit");

  exitButton.onclick = function(e){
    hide_keyboard();
  }

  //when num keys clicked, add its value to the input area string
  for(let i = 0; i < 10; i++){
    numBtn = document.querySelector(`#keyboard-button${i}`);
    numBtn.onclick = function(e){
      keyboardTextBox.value += i;
    }
  }

  for(let i = 0; i < 26; i++ ) {
    charCode = 65 + i; //65 being 'A'
    char = String.fromCharCode(charCode);
    charBtn = document.querySelector(`#keyboard-button${char}`);
    charBtn.onclick = function(e){
      keyboardTextBox.value += String.fromCharCode(65 + i);
    }
  }

  delButton.onclick = function(e){
    currentValue = keyboardTextBox.value;
    if(currentValue != null){
      keyboardTextBox.value = currentValue.substring(0, currentValue.length - 1);
    }
  }

  enterButton.onclick = function(e){
    currentValue = keyboardTextBox.value;
    if(enc.currentAccessState == enc.ACCESS_STATES.ADMIN) {
      currentSelection.set_password(currentValue);
      post_message(`${currentSelection.name} IS NOW PASSWORD PROTECTED.`)
      hide_keyboard();
    }
    else {
      hide_keyboard();
      password_check(currentValue);
    }
  }
}

function modify_password() {
  if(currentSelection.password) {
    keyboardTextBox.value = currentSelection.password;
  }
  keyboard.style.display = "block";
}

function input_password() {
  keyboard.style.display = "block";
}

function hide_keyboard(){
    keyboardTextBox.value = "";
    keyboard.style.display = "none";
}
