export default class PartIO {
  constructor(obj) {
    this.type = obj.type;
    this.behavior = {
      availability: parseFloat(obj.behavior.availability),
      generosity: parseFloat(obj.behavior.generosity),
      retention: parseFloat(obj.behavior.retention),
    };
    this.dict = [...obj.dict];
    this.inDict = {};
    this.outDict = null;
  }

  readObj = (obj) => {
    this.type = obj.type;
    const b = obj.behavior;
    this.behavior.availability = parseFloat(b.availability);
    this.behavior.generosity = parseFloat(b.generosity);
    this.behavior.retention = parseFloat(b.retention);
    this.dict = [...obj.dict];
    this.inDict = null;
    this.outDict = null;
  }

  dump = () => {
    return {
      type: this.type,
      behavior: {
        ...this.behavior
      },
      dict: this.dict
    };
  }
}
