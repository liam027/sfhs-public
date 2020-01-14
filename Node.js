
class Node{

  constructor() {
    this.name = "";
    this.tier = 0;
    this.isRestricted = false;
    this.startingUserVisibility = true;
    this.parent = "";
    this.children = [];
    this.guardedBy = [];
    this.content = "";
    this.description = "A NODE.";
    this.NODE_ACTIONS = [ ACTIONS.RENAME,
                      ACTIONS.PARENT,
                      ACTIONS.MODIFY_PASSWORD,
                      ACTIONS.INCREASE_TIER,
                      ACTIONS.DECREASE_TIER,
                      ACTIONS.TOGGLE_LOCK,
                      ACTIONS.TOGGLE_VISIBILITY,
                      ACTIONS.DELETE
                    ];
  }

  create_dom_element(){
    //container
    this.element = document.createElement("div");
    this.element.classList.add("node");
    this.element.id = "handle";

    //name tag
    let node_name = document.createElement("div");
    node_name.classList.add("node-name");
    this.element.appendChild(node_name);

    //node icon
    let node_icon = document.createElement("img");
    node_icon.classList.add("node-icon");
    this.element.appendChild(node_icon);

    //vis icon
    let node_vis_icon = document.createElement("img");
    node_vis_icon.src = ICONS.HIDDEN;
    node_vis_icon.classList.add("node-vis-icon");
    this.element.appendChild(node_vis_icon);

    //tier icon
    let node_tier_icon = document.createElement("span");
    node_tier_icon.classList.add("node-tier-icon");
    this.element.appendChild(node_tier_icon);

    //DC icon
    let node_dc_icon = document.createElement("span");
    node_dc_icon.classList.add("node-dc-icon");
    this.element.appendChild(node_dc_icon);
    
    //append it to screenframe and add drag functionality
    document.querySelector(".screen-frame").appendChild(this.element);
    mouseDragElement(this);
    touchDragElement(this);

    //make node selectable
    let self = this;
    this.element.onclick = function(e) {
      e.stopPropagation();
      select(self);
    }
  }

  live_update(loadObj) {
    this.set_active(loadObj.active);
    //this.set_start_vis(loadObj.startingUserVisibility);
    this.set_lock(loadObj.isRestricted);
    this.set_position(loadObj.posPercent)
  }

  set_position(percentPosition) {
    if(percentPosition) {
      this.load_position(percentPosition);
    }
    else {
      this.randomize_node_start();
    }
  }

  generate_standard_node(loadObj = false) {
    this.create_dom_element();
    this.create_node_line();
    this.description = this.DEFAULT_DESCRIPTION;
    if(loadObj) {
      this.load_node_properties(loadObj);
    }
    else {
      this.set_default_node_properties();
      post_message(`NEW ${this.name} CREATED.`);
    }
    this.update_node_line_origin_coordinates();
    this.calc_hack_DC(false);
    enc.nodes.push(this);
  }

  load_node_properties(loadObj) {
    this.set_name(loadObj.name);
    this.set_active(loadObj.active);
    this.set_id(loadObj.id);
    this.parent_id = loadObj.parent_id;
    this.set_start_vis(loadObj.startingUserVisibility);
    this.set_custom_DC(loadObj.customDC);
    this.set_lock(loadObj.isRestricted);
    this.set_tier(loadObj.tier);
    this.set_password(loadObj.password);
    this.set_position(loadObj.posPercent)
  }

  set_default_node_properties() {
    this.set_name(this.generate_new_name());
    this.set_active(this.DEFAULT_ACTIVE);
    this.set_id(this.generate_id());
    this.set_parent(enc.globalEntry);
    this.set_start_vis(this.DEFAULT_VISIBILITY);
    this.set_lock(this.DEFAULT_LOCK);
    this.set_tier(this.DEFAULT_TIER);
    this.NODE_ACTIONS.push(ACTIONS.SET_CUSTOM_DC);
    this.set_password("");
    this.randomize_node_start(); 
  }

  set_id(value) {
    this.id = value;
  }

  set_password(value) {
    this.password = value;
  }

  set_name(new_name) {
    this.name = new_name;
    this.element.querySelector(".node-name").innerHTML = new_name;
    post_target(this);
  }

  set_active(state) {
    if(state) {
      this.active = state;
      this.set_style(this.active);
    }
    else {
      this.active = state;
      this.set_style(this.active);
    }
  }

  toggle_active() {
    if(this.active) {
      post_message(`${this.name} IS NOW DISARMED.`);
      this.set_active(false);
    }
    else {
      post_message(`${this.name} IS NOW ARMED.`);
      this.set_active(true);
    }
  }

  set_style(active) {
    if(active) {
      this.set_main_icon(this.ICON_PATH);
      this.element.querySelector(".node-name").style.color = '#009933';
      this.element.querySelector(".node-tier-icon").style.color = '#009933';
      this.element.querySelector(".node-dc-icon").style.color = '#009933';
      this.element.style.borderColor = '#009933';
    }
    else {
      this.set_main_icon(ICONS.DISABLED);
      this.element.querySelector(".node-name").style.color = 'grey';
      this.element.querySelector(".node-tier-icon").style.color = 'grey';
      this.element.querySelector(".node-dc-icon").style.color = 'grey';
      this.element.style.borderColor = 'grey';
    }
  }

  toggle_line_visibility(){
    if(this.line != null){
      this.line.classList.toggle("hidden");
    }
  }

  set_parent(node){
    //if it has a parent and a new parent is assigned, remove this node from its parent's children list
    if(this.parent && this.parent != node) {
      remove_node_from_parents_children(this);
    }
    //assign parent
    this.parent = node;
    this.parent_id = node.id;
    node.children.push(this);
    //update the node lines to reflect
    this.update_node_line_parent_coordinates();
    post_target(this);
  }

  toggle_lock(displayMessage = false){
    let message = "";
    if(this.isRestricted){
      this.set_lock(false);
      message = `${this.name} IS NOW UN-LOCKED.`;
    }
    else{
      this.set_lock(true);
      message = `${this.name} IS NOW LOCKED.`;
    }
    if(displayMessage)  {
      post_message(message);
    }
    post_target(this);
  }

  set_lock(isLocked) {
    this.isRestricted = isLocked;
    if(isLocked) {
      this.set_main_icon(this.LOCKED_ICON_PATH);
    }
    else {
      this.set_main_icon(this.ICON_PATH);
    }
  }

  toggle_visibility_to_user(){
    if(!this.startingUserVisibility){
      this.set_start_vis(true);
      post_message(`${this.name} IS NOW VISIBLE TO USER.`)
      post_target(this);
    }
    else{
      this.set_start_vis(false);
      post_message(`${this.name} IS NOW HIDDEN TO USER.`)
      post_target(this);
    }
  }

  set_start_vis(visState) {
    this.startingUserVisibility = visState;
    if(visState) {
      this.set_visibility_icon(ICONS.VISIBLE);
    }
    else {
      this.set_visibility_icon(ICONS.HIDDEN);
    }
  }

  reveal(){
    this.element.classList.remove("hidden");
    if(this.nodeLine){
      this.nodeLine.classList.remove("hidden");
    }
    if(this.guarding) {
      this.guarding.forEach( function(target) {
        target.line.element.classList.remove("hidden");
      });
    }
  }

  hide(){
    this.element.classList.add("hidden");
    if(this.nodeLine){
      this.nodeLine.classList.add("hidden");
    }
    if(this.guarding) {
      this.guarding.forEach( function(target) {
        target.line.element.classList.add("hidden");
      });
    }
  }

  set_tier(_tier, displayMessage){
    if(_tier < 11 && _tier > -1) {
      this.tier = _tier
      this.set_tier_icon(_tier);
      if (displayMessage) post_message(`${this.name} TIER IS NOW ${this.tier}.`);
      post_target(this);
    }
  }

  calc_hack_DC(displayMessage) {
    if(this.customDC) {
      this.hackDC = this.customDC + enc.globalHackDCBonus;
    }
    else {
      if(this.root) {
        this.hackDC = rootHackDCByTier[this.tier] + enc.globalHackDCBonus;
      }
      else {
        this.hackDC = moduleHackDCByTier[this.tier] + enc.globalHackDCBonus;
      }
    }
    if (displayMessage) post_message(`${this.name} HACK DC IS NOW ${this.hackDC}.`);
    post_target(this);
    this.set_dc_icon(this.hackDC);
  }

  set_custom_DC(customDC) {
    if(customDC) {
      //set custom DC, swap clear/set actions, calculate the
      //nodes new DC, then refresh the context buttons
      this.customDC = customDC;
      this.NODE_ACTIONS = this.NODE_ACTIONS.filter(function(value, index, arr){
        return value != ACTIONS.SET_CUSTOM_DC;
      });
      this.NODE_ACTIONS.push(ACTIONS.CLEAR_CUSTOM_DC);
      if(currentSelection) {
        show_context_buttons();
      }
      this.calc_hack_DC(true);
    }
    else {
      this.NODE_ACTIONS.push(ACTIONS.SET_CUSTOM_DC);
    }
  }

  reset_custom_DC() {
    //clear custom DC, swap clear/set  actions, recalculate the
    //nodes DC based on tier and then refresh the context buttons
    this.customDC = "";
    this.NODE_ACTIONS = this.NODE_ACTIONS.filter(function(value, index, arr){
      return value != ACTIONS.CLEAR_CUSTOM_DC;
    });
    this.NODE_ACTIONS.push(ACTIONS.SET_CUSTOM_DC);
    this.calc_hack_DC(true);
    if(currentSelection) {
      show_context_buttons();
    }
  }

  create_node_line(){
    let canvas = document.querySelector(".canvas");
    let nodeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    nodeLine.id = `${this.name}-line`;
    nodeLine.classList.add("node-line");
    this.nodeLine = nodeLine;
    canvas.appendChild(nodeLine);
  }

  //#TODO refactor so this isn't repeated and is cleaner
  update_node_line_origin_coordinates(){
    let nodeBoundingBox = this.element.getBoundingClientRect();
    let screenFrameBoundingBox = screenFrame.getBoundingClientRect();
    let offsetX = nodeBoundingBox.width / 2 - screenFrameBoundingBox.x;
    let offsetY = nodeBoundingBox.height / 2 - screenFrameBoundingBox.y;
    let newX1 = this.element.getBoundingClientRect().x + offsetX;
    let newY1 = this.element.getBoundingClientRect().y + offsetY;
    this.nodeLine.setAttribute("x1", newX1.toString());
    this.nodeLine.setAttribute("y1", newY1.toString());
  }

  update_node_line_parent_coordinates(){
    let nodeBoundingBox = this.element.getBoundingClientRect();
    let screenFrameBoundingBox = screenFrame.getBoundingClientRect();
    let offsetX = nodeBoundingBox.width / 2 - screenFrameBoundingBox.x;
    let offsetY = nodeBoundingBox.height / 2 - screenFrameBoundingBox.y;
    let newX2 = this.parent.element.getBoundingClientRect().x + offsetX;
    let newY2 = this.parent.element.getBoundingClientRect().y + offsetY;
    this.nodeLine.setAttribute("x2", newX2.toString());
    this.nodeLine.setAttribute("y2", newY2.toString());
  }

  update_node_line_mouse_coordinates(mousePosX, mousePosY){
    this.nodeLine.setAttribute("x2", mousePosX.toString());
    this.nodeLine.setAttribute("y2", mousePosY.toString());
  }

  getParentClass(){
    return Object.getPrototypeOf(this.constructor).name
  }

  hack_success(){
    post_message(`${this.name} HACK SUCCESSFUL.`);
    this.set_lock(false);
    this.reveal_child_nodes();
  }

  reveal_child_nodes() {
    //reveal all child nodes of now unrestricted node
    if(this.children){
      for(let i = 0; i < this.children.length; i++){
          this.children[i].reveal();
          //if child is already unlocked, it should show it's hidden children as well
          if(!this.children[i].isRestricted) {
            this.children[i].reveal_child_nodes();
          }
      }
    }
  }

  hack_fail() {
    show_basic_alert("HACK FAILED!");
  }

  set_main_icon(path){
    this.element.querySelector(".node-icon").src = path;
  }
  set_visibility_icon(path){
    this.element.querySelector(".node-vis-icon").src = path;
  }
  set_tier_icon(value){
    this.element.querySelector(".node-tier-icon").innerHTML = `T${value}`;
  }
  set_dc_icon(value){
    this.element.querySelector(".node-dc-icon").innerHTML = `DC${value}`;
  }

  generate_id() {
    let new_id = enc.node_id_tracker;
    enc.node_id_tracker++;
    return new_id;
  }

  terminal_output() {
    this.info = ""; //remove any old information;
    this.info += target_terminal_format(`${this.description}`);
    return this.info
  }

  load_position(percentArray) {
    this.posPercent = percentArray;
    let newPos = node_percent_to_position(percentArray)
    newPos = snap_node(newPos);
    set_final_node_position(this, newPos);
  }

  randomize_node_start() {
    //randomize the node position (but near the center of the screen)
    let randX = 0.35 + (Math.random() * 0.2)
    let randY = 0.35 + (Math.random() * 0.2)
    this.load_position([randX, randY]);
  }

  save() {
    this.saveObj = {};
    this.saveObj['id'] = this.id;
    this.saveObj['name'] = this.name;
    this.saveObj['password'] = this.password;
    this.saveObj['tier'] = this.tier;
    this.saveObj['customDC'] = this.customDC;
    this.saveObj['isRestricted'] = this.isRestricted;
    this.saveObj['startingUserVisibility'] = this.startingUserVisibility;
    this.saveObj['active'] = this.active;
    this.saveObj['parent_id'] = this.parent_id;
    this.saveObj['posPercent'] = node_position_to_percent(this);
  }
}

function get_guard_ids(guardedArray) {
  return guardedArray.map(function(target) {
    return target.node.id;
  })
}

function remove_node_from_parents_children(node) {
  node.parent.children = node.parent.children.filter(function(value, index, arr){
    return value != node;
  });
}

function delete_node(node){
  //remove the deleted node from it's parent's children list
  if(node.parent) {
    node.nodeLine.remove()
    remove_node_from_parents_children(node);
  }
  //if this node has children and we delete it, it will be left dangling(no parent).
  //Instead, parent it to entry by default.
  node.children.forEach(function(child){
    child.set_parent(enc.globalEntry);
  });
  //remove the node from any guards
  if(node.guardedBy) {
    node.guardedBy.forEach( function(target) {
      target.node.remove_node_from_guarding(node);
    });
  }
  //if guarding then remove its own trigger lines
  if(node.guarding) {
    node.guarding.forEach( function(target) {
      node.remove_node_from_guarding(target.node);
    });
  }
  //remove the visual elements of the node
  node.element.remove();
  //remove the node from the nodes list
  enc.nodes = enc.nodes.filter(function(value){
    return value != node;
  });
  //refresh DCs in case the deleted node was providing a bonus
  refresh_all_node_DCs();
  //deselect the deleted node so it's infomation is no longer displayed
  deselect();
}

moduleHackDCByTier = { 0 : 10,
                          1 : 17,
                          2 : 21,
                          3 : 25,
                          4 : 29,
                          5 : 33,
                          6 : 37,
                          7 : 41,
                          8 : 45,
                          9 : 49,
                         10 : 53}

rootHackDCByTier = { 0 : 10,
                        1 : 37,
                        2 : 41,
                        3 : 45,
                        4 : 49,
                        5 : 53,
                        6 : 57,
                        7 : 61,
                        8 : 65,
                        9 : 69,
                        10 : 73}
