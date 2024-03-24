// Global variables
let spinePlayer;
let currentBackgroundColor = "rgba(0, 0, 0, 0)"; // Fully transparent
let activeSkins = []; //current active skins

// Function to initialize Spine Player
window.initializeSpinePlayer = (skins) => {
  console.log("webplayer.js: initializeSpinePlayer called.");

  if (!spine) {
    console.error("webplayer.js: spine is not defined.");
    return;
  }

  // Dispose of existing Spine Player instance if it exists
  if (spinePlayer) {
    console.log("Disposing of the existing Spine Player instance.");
    spinePlayer.dispose();
  }

  activeSkins = skins

  // Initialize the Spine player
  spinePlayer = new spine.SpinePlayer("spine-player-container", {
    jsonUrl: './raptor-pma.json',
    atlasUrl: './raptor-pma.atlas.txt',
    animation: "walk",
    skin: "default",
    showControls: false,
    premultipliedAlpha: true,
    backgroundColor: currentBackgroundColor,
    alpha: true,
    preserveDrawingBuffer: true,
    success: player => {
      console.log("webplayer.js: Spine model loaded successfully.");

      if (!Array.isArray(skins)) {
        console.error("skins array is undefined or not an array");
        return;
      }
      createSkinModel("custom-skin",skins, player)
    },
    error: error => {
      console.error("webplayer.js: Failed to load Spine model.", error);
    }
  });
};

// Function to check and initialize Spine Player
function assembleSkin(skins, attempts = 0) {
  if (spine) {
    window.initializeSpinePlayer(skins);
  } else if (attempts < 5) { // Retry limit set to 5
    console.error("Spine library is not loaded yet. Retrying initialization.");
    setTimeout(() => assembleSkin(skins, ++attempts), 500);
  } else {
    console.error("Failed to load Spine library after multiple attempts.");
  }
}

// without removing the current skin parts in other slots.
function dressModel(clothingItemsArray) {
  if (spinePlayer && spinePlayer.skeleton) {
    let activeSkin = spinePlayer.skeleton.skin || spinePlayer.skeleton.data.defaultSkin;
    let customSkin = new spine.Skin("custom-skin");

    // Add the current active skin to the custom skin
    customSkin.addSkin(activeSkin);

    // Add the selected clothing items to the custom skin
    clothingItemsArray.forEach(item => addToCustomSkin(customSkin, item));

    // Set the custom skin on the skeleton
    spinePlayer.skeleton.setSkin(customSkin);
    spinePlayer.skeleton.setSlotsToSetupPose();
    spinePlayer.skeleton.updateWorldTransform();
    console.log('Applied custom skins:', clothingItemsArray.join(', '));
  } else {
    console.error('Spine Player or skeleton not initialized.');
  }
};

function addToCustomSkin(customSkin, skinName) {
  let skinToAdd = spinePlayer.skeleton.data.findSkin(skinName);
  if (skinToAdd) {
    customSkin.addSkin(skinToAdd);
    if (!activeSkins.includes(skinName)) {
      activeSkins.push(skinName);
    }
  } else {
    console.error(`Skin not found: ${skinName}`);
  }
  console.log(activeSkins)
}

function removeFromSkin(skinNameToRemove) {
  activeSkins = activeSkins.filter(skinName => skinName !== skinNameToRemove);
  createSkinModel("skin-reconstructed", activeSkins);
  console.log(`Removed skin: ${skinNameToRemove}, and applied new custom skin`);
  console.log(activeSkins)
}

function createSkinModel(name, skins, player = spinePlayer) {
  let customSkin = new spine.Skin(name);
  skins.forEach(skinName => {
    let skinToAdd = player.skeleton.data.findSkin(skinName);
    if (skinToAdd) {
      customSkin.addSkin(skinToAdd);
      if (!activeSkins.includes(skinName)) {
        activeSkins.push(skinName);
      }
      console.log("Applying skin:", skinName);
    } else {
      console.error(`Skin not found: ${skinName}`);
    }
  });
      
  player.skeleton.setSkin(customSkin);
  player.skeleton.setSlotsToSetupPose();
}

function jump() {
  animation(0, "jump")
}

function roar() {
  animation(0, "roar")
}

function animation(channel, name, loop = false, after = "walk") {
  if (spinePlayer && spinePlayer.animationState) {
    const animationState = spinePlayer.animationState;

    animationState.setAnimation(channel, name, loop);
    animationState.addAnimation(channel, after, true, 0);
    console.log(`${name} animation should now play.`);
  } else {
    console.error('Spine Player or animation state not properly initialized.');
  }
}



// Call to start the initialization process
assembleSkin(["default"]);
