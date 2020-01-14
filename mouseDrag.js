function mouseDragElement(node) {
  if (node.element.querySelector("#handle")) {
    // if present, the header is where you move the DIV from:
    node.element.querySelector("#handle").onmousedown = dragMouseDown;
  } 
  else {
    //set the nodesize while we have access to the node element
    nodeWidth= node.element.getBoundingClientRect().width;
    // otherwise, move the DIV from anywhere inside the DIV:
    node.element.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      oldPos = current_mouse_pos(e);
      document.onmouseup = function(e) {
          closeMouseDragElement(e);
      };
      // call a function whenever the cursor moves:
      document.onmousemove = elementMouseDrag;
  }

  function calculate_position(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position and update the 'old position'
    newPos = [];
    newPos[0] = [oldPos[0] - e.clientX];
    newPos[1] = [oldPos[1] - e.clientY];
    oldPos = current_mouse_pos(e);

    // get what the element's new position will be:
    let calcPos = [];
    calcPos[0] = node.element.offsetLeft - newPos[0];
    calcPos[1] = node.element.offsetTop - newPos[1];
    return calcPos;
  }

  function elementMouseDrag(e) {
    calcPos = calculate_position(e);
    set_final_node_position(node, calcPos);
    refresh_node_lines(node);
  }

  function closeMouseDragElement(e) {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    //calc position a final time and snap if required
    calcPos = get_node_pos();
    if(snapOn) {
        calcPos = snap_node(calcPos);
    }
    set_final_node_position(node, calcPos);
    refresh_node_lines(node);
  }

  function current_mouse_pos(e) {
    let mousePos = [];
    mousePos[0] = e.clientX;
    mousePos[1] = e.clientY;
    return mousePos;
  }

  function get_node_pos() {
    nodePos = [];
    nodePos[0] = node.element.style.left.replace(/px/g, "");
    nodePos[1] = node.element.style.top.replace(/px/g, "");
    return nodePos;
  }
}

function verify_new_node_position(node, calcPos) {
  //get the width of the node icon
  nodeWidth = node.element.getBoundingClientRect().width;
  //get the bounding limits of where the element is allowed to move to
  let screenFrameBoundingRect = screenFrame.getBoundingClientRect()
  let limitLeft = screenFrameBoundingRect.x;
  let limitTop = screenFrameBoundingRect.y;
  let limitRight = limitLeft + screenFrameBoundingRect.width - nodeWidth;
  let limitBottom = limitTop + screenFrameBoundingRect.height - nodeWidth;
  //set final pos to the element's position if within the bounding limits, otherwise, return the limit of the boundary that was exceeded
  let finalPos = []
  if(calcPos[0] > limitLeft && calcPos[0] < limitRight) {
    finalPos[0] = calcPos[0] + "px";
  }
  else {
    if(calcPos[0] <= limitLeft) {
      finalPos[0] =  limitLeft + "px";
    }
    else {
      finalPos[0] =  limitRight + "px";
    }
  }

  if(calcPos[1] > limitTop && calcPos[1] < limitBottom) {
    finalPos[1] = calcPos[1] + "px";
  }
  else {
    if(calcPos[1] >= limitBottom) {
      finalPos[1] =  limitBottom + "px";
    }
    else {
      finalPos[1] =  limitTop + "px";
    }
  }
  return finalPos;
}



