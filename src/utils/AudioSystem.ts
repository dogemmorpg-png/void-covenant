class AudioEngine {
  public enabled: boolean = false;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public playHover() {}
  public playClick() {}
  public playError() {}
  public playAttack() {}
  public playHeal() {}
  public playPlace() {}
  public playDeath() {}
  public playMagic() {}
}

export const audioSystem = new AudioEngine();
