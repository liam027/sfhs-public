class Encounter {
    
    constructor() {
        this.name = "";
        this.nodes = [];
        this.dirs = [];
        this.files = [];
        this.modules = [];
        this.node_id_tracker = 0;

        this.numDirsCreated = 1;
        this.numFilesCreated = 1;
        this.numModsCreated = 1;
        this.numTrapsCreated = 1;
        this.numRootsCreated = 1;

        this.globalEntry = null;
        this.globalRoot = null;
        this.globalHackDCBonus = 0;

        this.userWelcomed = false;
        this.nodeDCVisibleToPlayer = false;
        this.timeElapsed = 0;
        this.timer = new Timer();
        
        this.ACCESS_STATES = {
            ADMIN: "ADMIN",
            USER: "USER",
            ROOT: "ROOT"
        }
        this.WORKSPACE_STATES = {
            SELECTION: "SELECTION",
            PARENT: "SELECT PARENT",
            GUARD: 'SELECT TARGET'
        }
        this.currentAccessState;
        this.currentWorkspaceState;
    }
    
    save() {
        this.saveObj = {};
        this.saveObj['name']  = sanitize(document.getElementById("computer-name-tag").value);
        this.saveObj['node_id_tracker'] = this.node_id_tracker;
        this.saveObj['numDirsCreated'] = this.numDirsCreated;
        this.saveObj['numFilesCreated'] = this.numFilesCreated;
        this.saveObj['numModsCreated'] = this.numModsCreated;
        this.saveObj['numTrapsCreated'] = this.numTrapsCreated;
        this.saveObj['numRootsCreated'] = this.numRootsCreated;
        this.saveObj['globalHackDCBonus'] = this.globalHackDCBonus;
        this.saveObj['nodeDCVisibleToPlayer'] = this.nodeDCVisibleToPlayer;
        return this.saveObj;
    }

    load(loadObj) {
        if(loadObj["name"]) {
            document.getElementById("computer-name-tag").value = loadObj['name'];
        }
        this.node_id_tracker = loadObj['node_id_tracker'];
        this.numDirsCreated = loadObj['numDirsCreated'];
        this.numFilesCreated = loadObj['numFilesCreated'];
        this.numModsCreated = loadObj['numModsCreated'];
        this.numTrapsCreated = loadObj['numTrapsCreated'];
        this.numRootsCreated = loadObj['numRootsCreated'];
        this.globalHackDCBonus = loadObj['globalHackDCBonus'];
        this.nodeDCVisibleToPlayer = loadObj['nodeDCVisibleToPlayer'];
        this.timer.reset();
    }
}