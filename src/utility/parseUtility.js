import {hasConfigVariable, getConfigVariable, InitStyleWithConfigVariable, processEvents, removePositionInfo, getScreenSize, getEmulatorSize} from './editUtility.js'
export function getResizeWidth(parent, element_styles, config, show_controls) {
  let styles = InitStyleWithConfigVariable(element_styles, config);
  if (styles.width) {
    if (styles.width.includes("screen_width") || styles.width.includes("screen_height")) {
      var screen = getScreenSize();
      if (show_controls) {
        screen = getEmulatorSize();
      }
      return getWidthOrHeightFromScreen(getCorrectScreenValue(styles.width,show_controls), styles.width);
    } else if (styles.width.includes("px")) {
      let width = styles.width.split("px")[0];
      return parseInt(width);
    } else if (styles.width.includes("%")) {
      let width_percent = parseInt(styles.width.split("%")[0]);
      let parent_width = (parent.$el.offsetWidth * width_percent) / 100;
      return parent_width;
    }
  }
}
export function getResizeHeight(parent, element_styles, config, show_controls) {
  let styles = InitStyleWithConfigVariable(element_styles, config);
  if (styles.height) {
    if (styles.height.includes("screen_width") || styles.height.includes("screen_height")) {
      return getWidthOrHeightFromScreen(getCorrectScreenValue(styles.height,show_controls) , styles.height);
    } else if (styles.height.includes("px")) {
      let height = styles.height.split("px")[0];
      return parseInt(height);
    } else if (styles.height.includes("%")) {
      let height_percent = parseInt(styles.height.split("%")[0]);
      let percent_height = (parent.$el.offsetHeight * height_percent) / 100;
      return percent_height;
    }
  }
}
export function getResizeLeft(parent, element_styles, config, show_controls) {
  let styles = InitStyleWithConfigVariable(element_styles, config);
  if (styles.left) {
    if (styles.left.includes("screen_width") || styles.left.includes("screen_height")) {
      console.log(getWidthOrHeightFromScreen(getCorrectScreenValue(styles.left,show_controls) , styles.left));
      return getWidthOrHeightFromScreen(getCorrectScreenValue(styles.left,show_controls) , styles.left);
    } else if (styles.left.includes("px")) {
      let left = styles.left.split("px")[0];
      return parseInt(left);
    } else if (styles.left.includes("%")) {
      let left_percent = parseInt(styles.left.split("%")[0]);
      let left_resize = (parent.$el.offsetHeight * left_percent) / 100;
      return left_resize;
    }
  }
}
export function getResizeTop(parent, element_styles, config , show_controls) {
  let styles = InitStyleWithConfigVariable(element_styles, config);
  if (styles.top) {
    if (styles.top.includes("screen_width") || styles.top.includes("screen_height")) {
      
      console.log(getWidthOrHeightFromScreen(getCorrectScreenValue(styles.top,show_controls) , styles.top));
      return getWidthOrHeightFromScreen(getCorrectScreenValue(styles.top,show_controls) , styles.top);
    } else if (styles.top.includes("px")) {
      let top = styles.top.split("px")[0];
      return parseInt(top);
    } else if (styles.top.includes("%")) {
      let top_percent = parseInt(styles.top.split("%")[0]);
      let top_resize = (parent.$el.offsetHeight * top_percent) / 100;
      return top_resize;
    }
  }
}

export function getResizeRight(parent, element_styles, config , show_controls) {
  let styles = InitStyleWithConfigVariable(element_styles, config);
  if (styles.right) {
    if (styles.right.includes("screen_width") || styles.right.includes("screen_height")) {
      return getWidthOrHeightFromScreen(getCorrectScreenValue(styles.right,show_controls) , styles.right);
    } else if (styles.right.includes("px")) {
      let right = styles.right.split("px")[0];
      return parseInt(right);
    } else if (styles.right.includes("%")) {
      let right_percent = parseInt(styles.right.split("%")[0]);
      let right_resize = (parent.$el.offsetHeight * right_percent) / 100;
      return right_resize;
    }
  }
}
export function getResizeBottom(parent, element_styles, config , show_controls) {
  let styles = InitStyleWithConfigVariable(element_styles, config);
  if (styles.bottom) {
    if (styles.bottom.includes("screen_width") || styles.bottom.includes("screen_height")) {
      return getWidthOrHeightFromScreen(getCorrectScreenValue(styles.bottom,show_controls) , styles.bottom);
    } else if (styles.bottom.includes("px")) {
      let bottom = styles.bottom.split("px")[0];
      return parseInt(bottom);
    } else if (styles.bottom.includes("%")) {
      let bottom_percent = parseInt(styles.bottom.split("%")[0]);
      let bottom_resize = (parent.$el.offsetHeight * bottom_percent) / 100;
      return bottom_resize;
    }
  }
}
export function getCorrectScreenValue(styleStr,show_controls) {
  var screen = getScreenSize();
  if (show_controls) {
    screen = getEmulatorSize();
  }
  if(styleStr.includes("screen_width")) {
    return screen.width;
  }
  return screen.height;
}
export function getZIndex(element_styles) {
  return parseInt(element_styles["z-index"]);
}
export function parseRadiusCorner(styles, type) {
  if (styles.hasOwnProperty("border-radius")) {
    var radius = styles["border-radius"];
    var array = radius.split(" ");
    if (Array.isArray(array)) {
      switch (type) {
        case "tl":
          if (array[0]) {
            return parseInt(array[0]);
          }
          break;
        case "tr":
          if (array[1]) {
            return parseInt(array[1]);
          }
          break;
        case "bl":
          if (array[3]) {
            return parseInt(array[3]);
          }
          break;
        case "br":
          if (array[2]) {
            return parseInt(array[2]);
          }
          break;
      }
    }
  }
  return 0;
}
export function getRotateString(style) {
  let start_index = style.indexOf("rotate");
  let end_index = style.indexOf(")", start_index);
  let rotate_string = style.substring(start_index, end_index + 1);
  return rotate_string;
}
export function getRotateValue(style) {
  let rotate_string = getRotateString(style);
  rotate_string = rotate_string.replace("rotate", "");
  rotate_string = rotate_string.replace("deg", "");
  rotate_string = rotate_string.replace("(", "");
  rotate_string = rotate_string.replace(")", "");
  rotate_string = rotate_string.replace(" ", "");
  return parseFloat(rotate_string);
}

export function parseBorderValues(style) {
  var array = style.split(" ");
  var border_arrays = { "type": "solid", "size": 0, "color": "#000000" };
  if (array.length == 3) {
    border_arrays["size"] = parseInt(array[0]);
    border_arrays["type"] = array[1];
    border_arrays["color"] = array[2];
  }
  return border_arrays;
}

export function parseShadowValues(style) {
  var array = style.split(" ");
  var border_arrays = { "size": 0, "color": "#000000" };
  if (style.includes("inset")) {
    if (array.length == 6) {
      border_arrays["size"] = -1 * parseInt(array[3]);
      border_arrays["color"] = array[5];
      console.log(border_arrays);
    }
  } else {
    if (array.length == 5) {
      border_arrays["size"] = parseInt(array[2]);
      border_arrays["color"] = array[4];
      console.log(border_arrays);
    }
  }
  return border_arrays;
}

export function replaceShadow(style, color, size) {
  var array = style.split(' ');
  let shawdowStyle = "";
  if (size >= 0) {
    if (style.includes("inset")) {
      shawdowStyle = array[1] + " " + array[2] + " " + size + "px " + array[4] + " " + color;
    } else {
      shawdowStyle = array[0] + " " + array[1] + " " + size + "px " + array[3] + " " + color;
    }
  } else {
    if (style.includes("inset")) {
      shawdowStyle = "inset " + array[1] + " " + array[2] + " " + -1 * size + "px " + array[4] + " " + color;
    } else {
      shawdowStyle = "inset " + array[0] + " " + array[1] + " " + -1 * size + "px " + array[3] + " " + color;
    }
  }
  return shawdowStyle;
}

export function getCurrentCornerPosition(layout) {
  var wrapper = layout["elements"][0];
  var style = wrapper["styles"];
  var result = "";
  if (style.hasOwnProperty("top")) {
    if (style.hasOwnProperty("left")) {
      return "Top Left";
    } else {
      return "Top Right";
    }
  } else {
    if (style.hasOwnProperty("left")) {
      return "Bottom Left";
    } else {
      return "Bottom Right";
    }
  }
}
export function getWidthOrHeightFromScreen(value, str) {
  if (str.includes("*")) {
    if (str.includes("+")) {
      let parray = str.split("+");
      let multi = getNumberValueFromScreenProperty(parray[0], "float");
      let plus = getNumberValueFromScreenProperty(parray[1], "int");
      return Math.floor(multi * value) + plus;
    } else if (str.includes("-")) {
      let parray = str.split("-");
      let multi = getNumberValueFromScreenProperty(parray[0], "float");
      let minus = getNumberValueFromScreenProperty(parray[1], "int");
      return Math.floor(multi * value) - minus;
    }
    var multi = getNumberValueFromScreenProperty(str, "float");
    return Math.floor(multi * value);
  } else if (str.includes("/")) {
    if (str.includes("+")) {
      let parray = str.split("+");
      let divide = getNumberValueFromScreenProperty(parray[0], "float");
      let plus = getNumberValueFromScreenProperty(parray[1], "int");
      return Math.floor(value / divide) + plus;
    } else if (str.includes("-")) {
      let parray = str.split("-");
      let divide = getNumberValueFromScreenProperty(parray[0], "float");
      let minus = getNumberValueFromScreenProperty(parray[1], "int");
      return Math.floor(value / divide) - minus;
    }
    var divide = getNumberValueFromScreenProperty(str, "float");
    return Math.floor(value / divide);
  }

  if (str.includes("+")) {
    var plus = getNumberValueFromScreenProperty(str, "int");
    return value + plus;
  } else if (str.includes("-")) {
    var minus = getNumberValueFromScreenProperty(str, "int");
    return value - minus;
  }
  return value;
}
export function getNumberValueFromScreenProperty(property, ctype) {
  let str = property.replace("screen_width", "").replace("screen_height", "").replace("-", "").replace("+", "").replace("*", "").replace("/", "");
  str = str.replace(" ", "");
  if (ctype == "int") {
    return parseInt(str);
  }
  return parseFloat(str);
}

export function describeChangedScreenValue(str, value) {
  if (str.includes("+")) {
    let parray = str.split("+");
    let dvalue = getNumberValueFromScreenProperty(parray[1], "float");
    let cvalue = dvalue + value;
    if (cvalue < 0) {
      return (parray[0] + "-" + (-1 * cvalue).toString());
    }
    return (parray[0] + "+" + cvalue.toString());
  } else if (str.includes("-")) {
    let marray = str.split("-");
    let dvalue = getNumberValueFromScreenProperty(marray[1], "float");
    let cvalue = dvalue - value;
    if (cvalue < 0) {
      return (marray[0] + "+" + (-1 * cvalue).toString());
    }

    return (marray[0] + "-" + cvalue.toString());
  }
  if(value<0) {
    return (str + "-" + (-1*value).toString());
  }else {
    return (str + "+" + value.toString());
  }
}